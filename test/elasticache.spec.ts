import cdk = require("@aws-cdk/core");
import "@aws-cdk/assert/jest";
import { ElastiCacheStackRequirement } from "../src/elasticache/elastiCacheStackRequirement";
import { ElastiCacheStack } from "../src/elasticache/elastiCacheStack";

describe("ElastiCache stack requirements test", () => {
  const requirement = new ElastiCacheStackRequirement();

  test("Should halt execution and throw error on illegal environment", () => {
    requirement.setEnvironment("TESTING");
    expect(() => {
      requirement.checkAllowedEnvironments();
    }).toThrowError(Error);
  });

  test("Should check environment is present", function() {
    requirement.setEnvironment("");
    expect(() => {
      requirement.checkEnvironmentIsPresent();
    }).toThrowError(Error);
  });
});

describe("Should create ElastiCache cluster", () => {
  const app = new cdk.App();
  const stack = new ElastiCacheStack(app, "dev", "abc123", "url", {
    env: {
      region: "ap-southeast-2"
    }
  });

  test("Should check replication group and properties", () => {
    expect(stack).toHaveResource("AWS::ElastiCache::ReplicationGroup", {
      Engine: "redis",
      CacheNodeType: "cache.t2.micro"
    });
  });

  test("Should check elasti cache subnet group", () => {
    expect(stack).toHaveResource("AWS::ElastiCache::SubnetGroup");
  });

  test("Should check security group", () => {
    expect(stack).toHaveResource("AWS::EC2::SecurityGroup");
  });

  test("Should check stack name", () => {
    expect(stack.stackName).toEqual("SampleProjectElastiCacheStack-dev");
  });
});
