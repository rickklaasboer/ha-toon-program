export interface Point {
  time: string;
  state: number;
}

export interface DayData {
  day: number;
  carry_in: number;
  points: Point[];
}

export interface Holiday {
  entry_id: string;
  start: string;
  end: string;
}

export interface ProgramAttributes {
  days: DayData[];
  program_hash: string;
  states: Record<string, number>;
  program_enabled: boolean;
  next_state: string | null;
  next_time: string | null;
  holidays: Holiday[];
  vacation_temperature: number;
}

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
}

export interface Hass {
  states: Record<string, HassEntity>;
  entities: Record<string, { platform: string; device_id?: string }>;
  language: string;
  callService(
    domain: string,
    service: string,
    data: Record<string, unknown>,
  ): Promise<unknown>;
}

export interface CardConfig {
  type: string;
  entity?: string;
}
