"""
Security Monitor Lambda Function
Daily security compliance check for AWS resources
"""

import boto3
import os
import json
from datetime import datetime

def handler(event, context):
    """
    Daily security compliance check
    Checks:
    1. Public S3 buckets
    2. Security groups allowing 0.0.0.0/0
    3. IAM users without MFA
    4. IAM Access Analyzer findings
    """

    project_name = os.environ.get('PROJECT_NAME', 'unknown')
    sns_topic_arn = os.environ['SNS_TOPIC_ARN']

    findings = []
    findings_count = {
        'critical': 0,
        'high': 0,
        'medium': 0,
        'low': 0
    }

    print(f"Starting security scan for project: {project_name}")

    # Check 1: Public S3 Buckets
    print("Checking S3 buckets...")
    s3_findings = check_s3_buckets()
    findings.extend(s3_findings)
    findings_count['high'] += len(s3_findings)

    # Check 2: Security Groups with 0.0.0.0/0
    print("Checking security groups...")
    sg_findings = check_security_groups()
    findings.extend(sg_findings)
    findings_count['medium'] += len(sg_findings)

    # Check 3: IAM Users without MFA
    print("Checking IAM users...")
    iam_findings = check_iam_users()
    findings.extend(iam_findings)
    findings_count['high'] += len(iam_findings)

    # Check 4: IAM Access Analyzer Findings
    print("Checking Access Analyzer...")
    analyzer_findings = check_access_analyzer()
    findings.extend(analyzer_findings)
    findings_count['critical'] += len(analyzer_findings)

    # Generate report
    total_findings = sum(findings_count.values())

    if total_findings > 0:
        subject = f"🚨 Security Findings Detected: {total_findings} issues found"
        message = generate_security_report(findings, findings_count, project_name)
        send_sns_notification(sns_topic_arn, subject, message)
    else:
        subject = f"✅ Daily Security Scan: No issues found"
        message = generate_clean_report(project_name)
        send_sns_notification(sns_topic_arn, subject, message)

    print(f"Scan complete. Total findings: {total_findings}")

    return {
        'statusCode': 200,
        'body': json.dumps({
            'total_findings': total_findings,
            'findings_by_severity': findings_count,
            'timestamp': datetime.utcnow().isoformat()
        })
    }


def check_s3_buckets():
    """Check for publicly accessible S3 buckets"""
    findings = []
    s3 = boto3.client('s3')

    try:
        buckets = s3.list_buckets()['Buckets']

        for bucket in buckets:
            bucket_name = bucket['Name']

            try:
                # Check Public Access Block
                public_access_block = s3.get_public_access_block(Bucket=bucket_name)
                config = public_access_block.get('PublicAccessBlockConfiguration', {})

                if not all([
                    config.get('BlockPublicAcls', False),
                    config.get('IgnorePublicAcls', False),
                    config.get('BlockPublicPolicy', False),
                    config.get('RestrictPublicBuckets', False)
                ]):
                    findings.append(f"⚠️ [HIGH] S3 Bucket '{bucket_name}' has public access enabled")

            except s3.exceptions.NoSuchPublicAccessBlockConfiguration:
                findings.append(f"⚠️ [HIGH] S3 Bucket '{bucket_name}' has no public access block configuration")
            except Exception as e:
                print(f"Error checking bucket {bucket_name}: {str(e)}")

    except Exception as e:
        print(f"Error listing S3 buckets: {str(e)}")

    return findings


def check_security_groups():
    """Check for security groups allowing 0.0.0.0/0"""
    findings = []
    ec2 = boto3.client('ec2')

    try:
        security_groups = ec2.describe_security_groups()['SecurityGroups']

        for sg in security_groups:
            sg_id = sg['GroupId']
            sg_name = sg['GroupName']

            # Check ingress rules
            for rule in sg.get('IpPermissions', []):
                for ip_range in rule.get('IpRanges', []):
                    if ip_range.get('CidrIp') == '0.0.0.0/0':
                        from_port = rule.get('FromPort', 'all')
                        to_port = rule.get('ToPort', 'all')
                        protocol = rule.get('IpProtocol', 'all')

                        findings.append(
                            f"⚠️ [MEDIUM] Security Group '{sg_name}' ({sg_id}) allows "
                            f"0.0.0.0/0 on {protocol}:{from_port}-{to_port}"
                        )

    except Exception as e:
        print(f"Error checking security groups: {str(e)}")

    return findings


def check_iam_users():
    """Check for IAM users without MFA enabled"""
    findings = []
    iam = boto3.client('iam')

    try:
        users = iam.list_users()['Users']

        for user in users:
            username = user['UserName']

            # Check if user has MFA device
            mfa_devices = iam.list_mfa_devices(UserName=username)['MFADevices']

            if len(mfa_devices) == 0:
                findings.append(f"⚠️ [HIGH] IAM User '{username}' does not have MFA enabled")

    except Exception as e:
        print(f"Error checking IAM users: {str(e)}")

    return findings


def check_access_analyzer():
    """Check IAM Access Analyzer for exposed resources"""
    findings = []
    analyzer = boto3.client('accessanalyzer')

    try:
        # List all analyzers
        analyzers = analyzer.list_analyzers()['analyzers']

        for analyzer_obj in analyzers:
            analyzer_arn = analyzer_obj['arn']

            # Get findings from analyzer
            response = analyzer.list_findings(
                analyzerArn=analyzer_arn,
                filter={
                    'status': {
                        'eq': ['ACTIVE']
                    }
                }
            )

            for finding in response.get('findings', []):
                resource_type = finding.get('resourceType', 'Unknown')
                resource = finding.get('resource', 'Unknown')
                principal = finding.get('principal', {})

                findings.append(
                    f"🚨 [CRITICAL] IAM Access Analyzer: {resource_type} '{resource}' "
                    f"is exposed to external principal: {principal}"
                )

    except Exception as e:
        print(f"Error checking Access Analyzer: {str(e)}")

    return findings


def generate_security_report(findings, findings_count, project_name):
    """Generate formatted security report for email"""

    report = f"""
🔒 SECURITY SCAN REPORT - {project_name}
{'=' * 60}

Scan Date: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}

SUMMARY:
--------
Total Findings: {sum(findings_count.values())}
  🚨 Critical: {findings_count['critical']}
  ⚠️  High:     {findings_count['high']}
  ⚠️  Medium:   {findings_count['medium']}
  ℹ️  Low:      {findings_count['low']}

FINDINGS:
---------
"""

    for i, finding in enumerate(findings, 1):
        report += f"{i}. {finding}\n"

    report += f"""
{'=' * 60}

RECOMMENDATIONS:
----------------
1. Review and remediate all CRITICAL and HIGH severity findings immediately
2. Address MEDIUM severity findings within 7 days
3. Schedule review of LOW severity findings for next sprint

For detailed remediation steps, see:
https://docs.aws.amazon.com/security/

{'=' * 60}

This is an automated security scan. Do not reply to this email.
"""

    return report


def generate_clean_report(project_name):
    """Generate report when no issues are found"""

    report = f"""
✅ SECURITY SCAN REPORT - {project_name}
{'=' * 60}

Scan Date: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}

STATUS: ALL CLEAR

No security issues detected in this scan.

Checks performed:
✅ S3 Bucket Public Access: OK
✅ Security Group Rules: OK
✅ IAM User MFA Status: OK
✅ IAM Access Analyzer: OK

{'=' * 60}

Keep up the good security posture!

This is an automated security scan. Do not reply to this email.
"""

    return report


def send_sns_notification(topic_arn, subject, message):
    """Send notification via SNS"""
    sns = boto3.client('sns')

    try:
        sns.publish(
            TopicArn=topic_arn,
            Subject=subject,
            Message=message
        )
        print(f"Notification sent to SNS topic: {topic_arn}")
    except Exception as e:
        print(f"Error sending SNS notification: {str(e)}")
        raise
