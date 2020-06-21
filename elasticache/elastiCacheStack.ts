import cdk = require('@aws-cdk/core');
import * as elastiCache from '@aws-cdk/aws-elasticache'
import ec2 = require('@aws-cdk/aws-ec2');
import * as sns from '@aws-cdk/aws-sns';
import * as subs from '@aws-cdk/aws-sns-subscriptions';
import parameters from "../parameters.json";

export class ElastiCacheStack extends cdk.Stack {
    constructor(app: cdk.App, environment: string, authToken: string, xMattersUrl: string, props?: cdk.StackProps) {
        super(app, `SampleProjectElastiCacheStack-${environment}`, props);
        const env: string = environment;
        (async () => {
            const environment:any = process.env.ENV;
            // create Security Groups for this ElastiCache cluster
            let mySecurityGroup = new ec2.SecurityGroup(this, 'SampleProjectElastiCacheSecurityGroup', {
                description: 'Allow access to Sample Project ElastiCache cluster',
                vpc: ec2.Vpc.fromVpcAttributes(this, parameters.environments[env].vpcName, {
                    vpcId: parameters.environments[env].vpcId,
                    availabilityZones: parameters.environments[env].availabilityZones
                }),
                allowAllOutbound: true
            });
            mySecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(6379), 'Allow access to Sample Project ElastiCache from any ipv4 ip');
            mySecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(6380), 'Allow access to Sample Project ElastiCache from any ipv4 ip');
            const redisSubnetGroup = new elastiCache.CfnSubnetGroup(
                this,
                "RedisClusterPrivateSubnetGroup",
                {
                    cacheSubnetGroupName: `private-subnet-elasticache-${env}`,
                    subnetIds: parameters.environments[env].subnetIds,
                    description: "Private Subnet for ElastiCache cluster"
                }
            );
            // create SNS topic
            // const xMattersTopic = new sns.Topic(this, 'SampleProject-ElastiCache-to-xMatters', {
            //     displayName: `Sample Project ElastiCache ${environment} SNS Topic`
            // });
            // add xMatters subscription with SNS filter
            // because we only want to be notified about the serious events
            // xMattersTopic.addSubscription(new subs.UrlSubscription(xMattersUrl, {
            //     filterPolicy: {
            //         event: sns.SubscriptionFilter.stringFilter({
            //             whitelist: [
            //                 'ElastiCache:CacheNodesRebooted',
            //                 'ElastiCache:CacheNodeReplaceStarted',
            //                 'ElastiCache:CacheClusterScalingFailed',
            //                 'ElastiCache:AddCacheNodeFailed',
            //                 'ElastiCache:NodeReplacementCanceled',
            //             ]
            //         }),
            //     }
            // }));

            const redisReplication = new elastiCache.CfnReplicationGroup(
                this,
                `RedisReplicaGroup`,
                {
                    engine: "redis",
                    cacheNodeType: parameters.environments[env].cacheNodeType,
                    replicasPerNodeGroup: parameters.environments[env].replicasPerNodeGroup,
                    numNodeGroups: parameters.environments[env].numNodeGroups,
                    automaticFailoverEnabled: true,
                    autoMinorVersionUpgrade: true,
                    replicationGroupDescription: `Sample Project Redis Cluster ${environment}`,
                    cacheSubnetGroupName: redisSubnetGroup.cacheSubnetGroupName,
                    securityGroupIds: [mySecurityGroup.securityGroupId],
                    transitEncryptionEnabled: true,
                    authToken: authToken,
                    port: parseInt(parameters.environments[env].port)
                    // notificationTopicArn: xMattersTopic.topicArn
                }
            );
            redisReplication.addDependsOn(redisSubnetGroup);

            // Publish the custom resource output
            new cdk.CfnOutput(this, 'RedisEndpoint', {
                description: 'The Redis cluster endpoints',
                value: redisReplication.attrPrimaryEndPointAddress
            });
        })().catch(error => console.log(error))
    }
}