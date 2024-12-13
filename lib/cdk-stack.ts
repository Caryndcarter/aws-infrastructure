import { CDK } from "@jaypie/cdk";
import * as cdk from "aws-cdk-lib";
import { HostedZone } from "aws-cdk-lib/aws-route53";
import { Construct } from "constructs";

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //
    //
    // Setup
    //

    // * Convert all CDK_ENV vars to local instances
    // * Do not use CDK_ENV vars past this section

    const config = {
      hostedZoneName: process.env.CDK_ENV_HOSTED_ZONE_NAME,
    };

    // * Do not use CDK_ENV vars past this point

    //
    //
    // Resources
    //

    // Route 53
    if (config.hostedZoneName) {
      const hostedZone = new HostedZone(this, "HostedZone", {
        zoneName: config.hostedZoneName,
      });
      cdk.Tags.of(hostedZone).add(CDK.TAG.ROLE, CDK.ROLE.NETWORKING);
    }
  }
}
