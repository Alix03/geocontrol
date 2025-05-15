import { Entity, PrimaryColumn, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from "typeorm";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { MeasurementDAO } from "@models/dao/MeasurementDAO";

@Entity("sensors")
export class SensorDAO {
  @PrimaryGeneratedColumn()
  id: number
  
  @Column({ nullable: false, unique: true })
  macAddress: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  description: string;

  @Column({ nullable: false })
  variable: string;

  @Column({ nullable: false })
  unit: string;

  @ManyToOne(() => GatewayDAO, (gateway) => gateway.sensors)
  gateway: GatewayDAO;

  @OneToMany(() => MeasurementDAO, (mes) => mes.sensor)
   measurements: MeasurementDAO[];
}
