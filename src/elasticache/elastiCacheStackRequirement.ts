// @ts-ignore
import parameters from "../parameters.json";

export class ElastiCacheStackRequirement {
  private environment: any;

  public checkEnvironmentIsPresent() {
    if (!this.environment)
      throw new Error("Environment (ENV) must be passed-in from command line.");
  }

  public checkAllowedEnvironments() {
    if (!Object.keys(parameters.environments).includes(this.environment))
      throw new Error(
        `The given environment ${this.environment} is not allowed. Please check parameters.json file.`
      );
  }

  public setEnvironment(environment: any) {
    this.environment = environment;
  }
}
