import {Entity, Column, ManyToOne, PrimaryGeneratedColumn, Unique, OneToMany} from "typeorm";
import { NetworkDAO } from "./NetworkDAO";
import { SensorDAO } from "./SensorDAO";

@Entity("gateways")
@Unique(["macAddress"])
export class GatewayDAO{
    @PrimaryGeneratedColumn()
    id : number

    @Column({nullable: false})
    macAddress: string

    @Column({nullable: true})
    name?: string

    @Column({nullable: true})
    description?: string


    @ManyToOne(() => NetworkDAO, (network) => network.gateways, { onDelete: "CASCADE"})
network: NetworkDAO;

    @OneToMany(() => SensorDAO, (sensor) => sensor.gateway, { cascade:true, eager:true })
sensors: SensorDAO [];

}
