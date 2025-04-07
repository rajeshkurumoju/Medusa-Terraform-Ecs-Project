resource "aws_ecs_cluster" "medusa_cluster" {
  name = "${var.project_name}-cluster"
}

resource "aws_ecs_task_definition" "medusa_task" {
  family                   = "${var.project_name}-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_exec_role.arn
  container_definitions = jsonencode([
    {
      name      = "medusa"
      image     = "637423317288.dkr.ecr.us-east-1.amazonaws.com/medusa-repo:latest"
      portMappings = [
        {
          containerPort = 9000
          hostPort      = 9000
        }
      ],
      environment = [
        {
          name  = "DATABASE_URL"
          value = "postgres://postgres:${var.db_password}@${aws_db_instance.medusa_db.address}:5432/medusadb"
        }
      ]
    }
  ])
}

resource "aws_ecs_service" "medusa_service" {
  name            = "${var.project_name}-service"
  cluster         = aws_ecs_cluster.medusa_cluster.id
  task_definition = aws_ecs_task_definition.medusa_task.arn
  desired_count   = 1
  launch_type     = "FARGATE"
  network_configuration {
    subnets         = ["subnet-094a6ff460330bdda"]
    security_groups = ["sg-090d968695dc388eb"]
    assign_public_ip = true
  }
}
