#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { CdkStack } from "../lib/cdk-stack";

const app = new cdk.App();
const {
  CDK_DEFAULT_ACCOUNT,
  CDK_DEFAULT_REGION,
  PROJECT_KEY = "infrastructure",
  PROJECT_NONCE = "b5fbc927",
  PROJECT_SPONSOR = "aws",
} = process.env;

if (!PROJECT_KEY || !PROJECT_NONCE || !PROJECT_SPONSOR) {
  throw new Error("Missing required environment variables");
}

const stackName = `cdk-${PROJECT_SPONSOR}-${PROJECT_KEY}-${PROJECT_NONCE}`;

new CdkStack(app, "CdkStack", {
  env: { account: CDK_DEFAULT_ACCOUNT, region: CDK_DEFAULT_REGION },
  stackName,
});
