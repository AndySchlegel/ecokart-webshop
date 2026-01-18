# ============================================================================
# Lambda Module - Backend API + API Gateway
# ============================================================================
# Erstellt Lambda Function, API Gateway und notwendige IAM Permissions.

# ----------------------------------------------------------------------------
# Lambda Deployment Package - AUTO BUILD
# ----------------------------------------------------------------------------
# Terraform baut Lambda ZIP automatisch bei jedem Apply.
# Das stellt sicher, dass Nuclear + Deploy IMMER den aktuellsten Code hat!
#
# Build-Prozess:
# 1. npm install im Backend
# 2. npm run build (TypeScript → JavaScript)
# 3. ZIP erstellen mit .deploy-timestamp
# 4. Lambda Function verwendet dieses ZIP
#
# VORTEIL: 100% reproduzierbar, kein manueller Build nötig!

resource "null_resource" "lambda_build" {
  # Trigger rebuild bei jedem Apply (via timestamp)
  # So ist der Code IMMER aktuell!
  triggers = {
    always_rebuild = timestamp()
  }

  provisioner "local-exec" {
    command = <<-EOT
      set -e
      echo "🔨 Building Lambda backend..."

      # Get absolute paths to avoid issues when changing directories
      TERRAFORM_ROOT="$(pwd)"
      BACKEND_DIR="$TERRAFORM_ROOT/${var.source_path}"
      BUILDS_DIR="$TERRAFORM_ROOT/modules/lambda/builds"
      ZIP_NAME="${var.function_name}.zip"

      echo "📍 Terraform root: $TERRAFORM_ROOT"
      echo "📍 Backend dir: $BACKEND_DIR"
      echo "📍 Builds dir: $BUILDS_DIR"

      # Navigate to backend directory
      cd "$BACKEND_DIR"
      echo "📍 Now in: $(pwd)"

      # Install all dependencies (including dev dependencies for build)
      echo "📦 Installing dependencies..."
      npm ci --production=false

      # Build TypeScript to JavaScript
      echo "🏗️  Compiling TypeScript..."
      npm run build

      # Create builds directory if it doesn't exist
      mkdir -p "$BUILDS_DIR"

      # Create ZIP with deployment timestamp
      echo "📦 Creating Lambda ZIP..."
      cd dist

      # Add deployment timestamp to make ZIP unique
      echo "terraform-build-$(date +%s)" > .deploy-timestamp

      # Create ZIP in terraform builds folder (using absolute path!)
      zip -r "$BUILDS_DIR/$ZIP_NAME" . ../node_modules ../package.json -x "*.test.js" -q

      echo "✅ Lambda ZIP created: $ZIP_NAME"
      echo "📦 Location: $BUILDS_DIR/$ZIP_NAME"
    EOT

    # Working directory is terraform root (where we run terraform apply)
    working_dir = path.root
  }
}

# ----------------------------------------------------------------------------
# Lambda Function
# ----------------------------------------------------------------------------
# Express.js App als Lambda Function (via serverless-http)
# WICHTIG: depends_on lambda_build - wartet bis Build fertig ist!

resource "aws_lambda_function" "api" {
  function_name    = var.function_name
  description      = "Ecokart Backend API - Express on Lambda"
  role             = aws_iam_role.lambda_exec.arn
  handler          = "dist/lambda.handler"
  runtime          = var.runtime
  memory_size      = var.memory_size
  timeout          = var.timeout
  architectures    = ["x86_64"]

  filename         = "${path.module}/builds/${var.function_name}.zip"
  # Use try() to handle case where ZIP doesn't exist yet (first run)
  # Falls back to timestamp hash to force update
  source_code_hash = try(
    filebase64sha256("${path.module}/builds/${var.function_name}.zip"),
    base64sha256(timestamp())
  )

  # Environment Variables
  environment {
    variables = var.environment_variables
  }

  # Dependencies: Build muss fertig sein + CloudWatch Logs müssen existieren
  depends_on = [
    null_resource.lambda_build,
    aws_cloudwatch_log_group.lambda_logs,
    aws_iam_role_policy_attachment.lambda_logs
  ]

  tags = merge(
    var.tags,
    {
      Name = var.function_name
    }
  )
}

# ----------------------------------------------------------------------------
# CloudWatch Log Group
# ----------------------------------------------------------------------------
# Lambda Logs mit konfigurierbarer Retention

resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/${var.function_name}"
  retention_in_days = 14

  tags = var.tags
}

# ----------------------------------------------------------------------------
# API Gateway REST API
# ----------------------------------------------------------------------------
# REST API mit Proxy-Integration zu Lambda

resource "aws_api_gateway_rest_api" "api" {
  name        = "${var.function_name}-gateway"
  description = "API Gateway for Ecokart Backend"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = var.tags
}

# Root Resource (/)
resource "aws_api_gateway_method" "root_method" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_rest_api.api.root_resource_id
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "root_integration" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_rest_api.api.root_resource_id
  http_method = aws_api_gateway_method.root_method.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.api.invoke_arn
}

# Proxy Resource (/{proxy+})
resource "aws_api_gateway_resource" "proxy" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "proxy_method" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.proxy.id
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "proxy_integration" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.proxy.id
  http_method = aws_api_gateway_method.proxy_method.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.api.invoke_arn
}

# ----------------------------------------------------------------------------
# API Gateway Deployment
# ----------------------------------------------------------------------------

resource "aws_api_gateway_deployment" "api" {
  rest_api_id = aws_api_gateway_rest_api.api.id

  triggers = {
    # Re-deploy bei API-Änderungen
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.proxy.id,
      aws_api_gateway_method.root_method.id,
      aws_api_gateway_method.proxy_method.id,
      aws_api_gateway_integration.root_integration.id,
      aws_api_gateway_integration.proxy_integration.id,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [
    aws_api_gateway_integration.root_integration,
    aws_api_gateway_integration.proxy_integration
  ]
}

# API Gateway Stage
resource "aws_api_gateway_stage" "api" {
  deployment_id = aws_api_gateway_deployment.api.id
  rest_api_id   = aws_api_gateway_rest_api.api.id
  stage_name    = var.api_stage_name

  # CloudWatch Logs (optional)
  dynamic "access_log_settings" {
    for_each = var.enable_access_logs ? [1] : []
    content {
      destination_arn = aws_cloudwatch_log_group.api_gateway_logs[0].arn
      format = jsonencode({
        requestId      = "$context.requestId"
        ip             = "$context.identity.sourceIp"
        caller         = "$context.identity.caller"
        user           = "$context.identity.user"
        requestTime    = "$context.requestTime"
        httpMethod     = "$context.httpMethod"
        resourcePath   = "$context.resourcePath"
        status         = "$context.status"
        protocol       = "$context.protocol"
        responseLength = "$context.responseLength"
      })
    }
  }

  tags = var.tags
}

# API Gateway CloudWatch Log Group (optional)
resource "aws_cloudwatch_log_group" "api_gateway_logs" {
  count             = var.enable_access_logs ? 1 : 0
  name              = "/aws/apigateway/${var.function_name}"
  retention_in_days = 7

  tags = var.tags
}

# ----------------------------------------------------------------------------
# Lambda Permission für API Gateway
# ----------------------------------------------------------------------------

resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"

  # API Gateway darf Lambda über ALLE Pfade aufrufen
  source_arn = "${aws_api_gateway_rest_api.api.execution_arn}/*/*"
}

# ----------------------------------------------------------------------------
# CORS Configuration (optional, falls nötig)
# ----------------------------------------------------------------------------
# CORS wird im Express-Backend via cors-Middleware konfiguriert
# Keine zusätzliche API Gateway CORS-Konfiguration nötig
