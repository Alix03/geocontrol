import {Entity, Column, ManyToOne, PrimaryGeneratedColumn, Unique} from "typeorm";
import { NetworkDAO } from "./NetworkDAO";

@Entity("gateways")
@Unique(["macAddress"])
export class GatewayDAO{
    @PrimaryGeneratedColumn()
    id : number

    @Column({nullable: false})
    macAddress: string

    @Column({nullable: false})
    name: string

    @Column({nullable: false})
    description: string

    @ManyToOne(() => NetworkDAO, (network) => network.gateways, { onDelete: "CASCADE" })
network: NetworkDAO;

}
