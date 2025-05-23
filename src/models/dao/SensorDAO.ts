import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from "typeorm";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { MeasurementDAO } from "@models/dao/MeasurementDAO";

@Entity("sensors")
export class SensorDAO {
  @PrimaryGeneratedColumn()
  id: number
  
  @Column({ nullable: false, unique: true })
  macAddress: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  variable: string;

  @Column()
  unit: string;

  @ManyToOne(() => GatewayDAO, (gateway) => gateway.sensors, { onDelete: "CASCADE"})
  gateway: GatewayDAO;

  @OneToMany(() => MeasurementDAO, (mes) => mes.sensor, {cascade: true})
   measurements: MeasurementDAO[];
}
