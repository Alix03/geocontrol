import { Entity, PrimaryColumn, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { GatewayDAO } from "./GatewayDAO";

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
  //da aggiungere onetomany in gatewayDAO

  @OneToMany(() => Mesaurement, (mes) => mes.sensor)
    measurements: MeasurementDAO[];
}
