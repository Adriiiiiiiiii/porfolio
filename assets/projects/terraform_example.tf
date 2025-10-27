# Minimal Terraform example (lab) — not intended for production
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = var.region
  # credentials via env or shared config
}

variable "region" {
  default = "eu-west-1"
}

resource "aws_vpc" "lab" {
  cidr_block = "10.100.0.0/16"
  tags = { Name = "lab-vpc" }
}

resource "aws_subnet" "public" {
  vpc_id            = aws_vpc.lab.id
  cidr_block        = "10.100.1.0/24"
  availability_zone = "${var.region}a"
  tags = { Name = "lab-public" }
}

resource "aws_security_group" "ssh_only" {
  name        = "ssh-only"
  description = "Allow SSH from specific IP"
  vpc_id      = aws_vpc.lab.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # tighten for real use
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}