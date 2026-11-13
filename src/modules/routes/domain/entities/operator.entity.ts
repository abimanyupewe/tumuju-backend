export interface OperatorProps {
  id: string;
  name: string;
  mode: 'train' | 'bus' | 'angkot';
  source: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class OperatorEntity {
  private constructor(private readonly props: OperatorProps) {}

  public static create(props: OperatorProps): OperatorEntity {
    return new OperatorEntity({
      ...props,
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    });
  }

  public get id(): string {
    return this.props.id;
  }

  public get name(): string {
    return this.props.name;
  }

  public get mode(): string {
    return this.props.mode;
  }

  public get source(): string {
    return this.props.source;
  }

  public toJSON(): OperatorProps {
    return { ...this.props };
  }
}
