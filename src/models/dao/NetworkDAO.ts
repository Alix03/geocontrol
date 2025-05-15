import { Entity, Column,PrimaryGeneratedColumn, Unique, OneToMany  } from "typeorm";

@Entity("networks")
@Unique(["code"])
export class NetworkDAO{

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    code: string

    @Column({ nullable: false })
    name: string

    @Column({ nullable: false })
    description: string

    /*
    @OneToMany(() => GatewayDAO, gateway => gateway.network, {
        cascade: true, // opzionale: salva gateway insieme alla network
        eager: true // opzionale: carica i gateway automaticamente
    })
    gateways: GatewayDAO[]; 


    In gatewayDAO ci deve essere questo
    @ManyToOne(() => NetworkDAO, network => network.gateways)
    network: NetworkDAO;
    
    */
    
}


