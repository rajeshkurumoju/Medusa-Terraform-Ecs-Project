resource "aws_db_instance" "medusa_db" {
  allocated_storage    = 20
  engine               = "postgres"
  engine_version       = "15.4"                     # optional, but recommended
  instance_class       = "db.t3.micro"
  db_name              = "medusadb"                 # ← replace 'name' with 'db_name'
  username             = "postgres"
  password             = var.db_password
  skip_final_snapshot  = true
  publicly_accessible  = true                       # optional, only if needed
}
