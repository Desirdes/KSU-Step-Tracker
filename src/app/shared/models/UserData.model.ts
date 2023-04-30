export class Person {
  public id: number;
  public full_name: string;
  public email: string;
  public gender: string;
  public demographic: string;
  public age: number;
  public username: string;
  public signupDate: Date;
  public targets: TargetData[];
  public biometrics: BiometricData[];
  public activities: ActivityData[];
}

export class TargetData {
  public id: number;
  public dailySteps: number;
  public personID: number;
  public weightLoss: number;
  public weightLossPercentage: number;
  public dateUpdated: Date;
}

export class BiometricData {
  public id: number;
  public bodyFatPercentage: number;
  public height: number;
  public neckCircumference: number;
  public waistCircumference: number;
  public weight: number;
  public personID: number;
  public dateUpdated: Date;
}

export class ActivityData {
  public id: number;
  public date: Date;
  public steps: number;
  public personID: number;
}
