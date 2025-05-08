import {Entity, PrimaryColumn, Column, ManyToOne} from "typeorm";
import { NetworkDAO } from "./NetworkDAO";

@Entity("gateways")
export class GatewayDAO{
    @PrimaryColumn({nullable: false})
    macAddress: string

    @Column({nullable: false})
    name: string

    @Column({nullable: false})
    description: string

    @ManyToOne(() => NetworkDAO, (network) => network.gateways, { onDelete: "CASCADE" })
network: NetworkDAO;

}
