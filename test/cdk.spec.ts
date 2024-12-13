import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { CdkStack } from "../lib/cdk-stack";

describe("CdkStack", () => {
  test("creates hosted zone when hostedZoneName is provided", () => {
    // ARRANGE
    const app = new cdk.App({});
    process.env.CDK_ENV_HOSTED_ZONE_NAME = "example.com";

    // ACT
    const stack = new CdkStack(app, "TestStack");
    const template = Template.fromStack(stack);

    // ASSERT
    template.hasResourceProperties("AWS::Route53::HostedZone", {
      Name: "example.com.",
      HostedZoneTags: [
        {
          Key: "role",
          Value: "networking",
        },
      ],
    });
  });

  test("does not create hosted zone when hostedZoneName is not provided", () => {
    // ARRANGE
    const app = new cdk.App();
    delete process.env.CDK_ENV_HOSTED_ZONE_NAME;

    // ACT
    const stack = new CdkStack(app, "TestStack");
    const template = Template.fromStack(stack);

    // ASSERT
    template.resourceCountIs("AWS::Route53::HostedZone", 0);
  });
});
