import { App, Stack, StackProps } from "@aws-cdk/core";
import { Bucket, BucketPolicy } from "@aws-cdk/aws-s3";
import * as iam from "@aws-cdk/aws-iam";
import { Effect } from "@aws-cdk/aws-iam";

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
      new iam.PolicyStatement({
        sid: "Stmt8882271437483",
        actions: ["s3:GetObject"],
        effect: Effect.DENY,
        principals: [new iam.AnyPrincipal()],
        resources: ["arn:aws:s3:::avant-systems-test-bucket/*"],
        conditions: {
          NotIpAddress: {
            "aws:SourceIp": [
              "165.225.226.0/23",
              "203.210.82.0/24",
              "3.105.1.245/32",
              "194.223.47.45/32"
            ]
          }
        }
      })
    );
  }
}
