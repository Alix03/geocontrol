import { Entity, PrimaryColumn, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from "typeorm";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { MeasurementDAO } from "@models/dao/MeasurementDAO";

@Entity("sensors")
export class SensorDAO {
  @PrimaryGeneratedColumn()
  id: number
  
  @Column({ nullable: false, unique: true })
  macAddress: string;

  @Column({nullable : true})
  name: string;

  @Column({nullable : true})
  description: string;

  @Column({nullable : true})
  variable: string;

  @Column({nullable : true})
  unit: string;

  @ManyToOne(() => GatewayDAO, (gateway) => gateway.sensors, { onDelete: "CASCADE"})
  gateway: GatewayDAO;

  @OneToMany(() => MeasurementDAO, (mes) => mes.sensor, {cascade: true})
   measurements: MeasurementDAO[];
}
