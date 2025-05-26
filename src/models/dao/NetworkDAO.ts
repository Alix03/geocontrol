import { Entity, Column,PrimaryGeneratedColumn, Unique, OneToMany  } from "typeorm";
import { GatewayDAO } from "./GatewayDAO";

@Entity("networks")
@Unique(["code"])
export class NetworkDAO{

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    code: string

    @Column({ nullable: true })
    name?: string | null

    @Column({ nullable: true })
    description?: string | null

    
    @OneToMany(() => GatewayDAO, gateway => gateway.network, {
        cascade: true, // opzionale: salva gateway insieme alla network
        eager: true // opzionale: carica i gateway automaticamente
    })
    gateways: GatewayDAO[]; 


    
}


