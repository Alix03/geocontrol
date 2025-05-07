import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("sensors")
export class SensorDAO {
  @PrimaryColumn({ nullable: false })
  macAddress: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  description: string;

  @Column({ nullable: false })
  variable: string;

  @Column({ nullable: false })
  unit: string;
}
