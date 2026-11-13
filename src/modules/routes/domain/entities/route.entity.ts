export interface RouteStopItem {
  id: string;
  stopId: string;
  stopName: string;
  stopCode?: string | null;
  latitude: number;
  longitude: number;
  stopSequence: number;
  direction: 'outbound' | 'inbound';
}

export interface RouteProps {
  id: string;
  operatorId: string;
  operatorName?: string;
  routeCode: string;
  name: string;
  mode: 'train' | 'bus' | 'angkot';
  source: string;
  status: 'active' | 'unverified' | 'planned';
  stops: RouteStopItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class RouteEntity {
  private constructor(private readonly props: RouteProps) {}

  public static create(props: RouteProps): RouteEntity {
    return new RouteEntity({
      ...props,
      stops: props.stops || [],
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    });
  }

  public get id(): string {
    return this.props.id;
  }

  public get operatorId(): string {
    return this.props.operatorId;
  }

  public get operatorName(): string | undefined {
    return this.props.operatorName;
  }

  public get routeCode(): string {
    return this.props.routeCode;
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

  public get status(): string {
    return this.props.status;
  }

  public get stops(): RouteStopItem[] {
    return [...this.props.stops].sort(
      (a, b) => a.stopSequence - b.stopSequence,
    );
  }

  public toJSON(): RouteProps {
    return { ...this.props, stops: this.stops };
  }
}
