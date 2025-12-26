# ============================================================================
# Seed Data Resource - Populate Database with Demo Data
# ============================================================================
# Purpose: Automatically seed the database with realistic demo data after deployment
#
# Features:
# - 30 days of order history
# - 40 customers with various registration dates
# - Updated product stock levels (high/medium/low/critical mix)
# - Realistic revenue patterns and sales distribution
# ============================================================================

resource "null_resource" "seed_demo_data" {
  # Dependencies: Wait for all tables to be created
  depends_on = [
    aws_dynamodb_table.products,
    aws_dynamodb_table.users,
    aws_dynamodb_table.orders,
    aws_dynamodb_table.carts
  ]

  # Triggers: Re-run seed if seed script version changes
  triggers = {
    seed_script_hash = filemd5("${path.module}/../../scripts/seed-data.js")
    seed_version = "v1.0"
  }

  # Provisioner: Install dependencies and run seed script
  provisioner "local-exec" {
    command = <<-EOT
      echo "📦 Installing seed script dependencies..."
      npm install --prefix ${path.module}/../../scripts --silent

      echo "🌱 Running seed data script..."
      AWS_PROFILE=${var.aws_profile} \
      AWS_REGION=${var.aws_region} \
      ORDERS_TABLE=${aws_dynamodb_table.orders.name} \
      CUSTOMERS_TABLE=${aws_dynamodb_table.users.name} \
      PRODUCTS_TABLE=${aws_dynamodb_table.products.name} \
      node ${path.module}/../../scripts/seed-data.js
    EOT
  }
}

# ============================================================================
# Outputs
# ============================================================================

output "seed_status" {
  description = "Seed data resource status"
  value = {
    enabled = true
    version = "v1.0"
    tables = {
      products = aws_dynamodb_table.products.name
      users = aws_dynamodb_table.users.name
      orders = aws_dynamodb_table.orders.name
      carts = aws_dynamodb_table.carts.name
    }
  }
}
