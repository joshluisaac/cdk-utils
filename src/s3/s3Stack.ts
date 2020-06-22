import { App, Stack, StackProps } from "@aws-cdk/core";
import { Bucket, BucketPolicy } from "@aws-cdk/aws-s3";
import { Effect, AnyPrincipal, PolicyStatement } from "@aws-cdk/aws-iam";

export class s3Stack extends Stack {
  constructor(scope: App, environmentId: string, props?: StackProps) {
    super(scope, `SampleProjectS3Stack-${environmentId}`, props);
    const sampleBucket = new Bucket(this, "SampleBucket", {
      bucketName: "avant-systems-test-bucket",
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "index.html"
    });
    sampleBucket.policy = new BucketPolicy(this, "SampleBucket Policy", {
      bucket: sampleBucket
    });
    sampleBucket.addToResourcePolicy(
      new PolicyStatement({
        sid: "Stmt8882271437483",
        actions: ["s3:GetObject"],
        effect: Effect.ALLOW,
        principals: [new AnyPrincipal()],
        resources: ["arn:aws:s3:::avant-systems-test-bucket/*"],
        conditions: {
          IpAddress: {
            "aws:SourceIp": ["203.221.212.0/24"]
          }
        }
      })
    );
  }
}
