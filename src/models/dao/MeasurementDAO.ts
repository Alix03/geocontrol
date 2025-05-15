import { Entity, Column, ManyToOne, PrimaryColumn } from "typeorm";
import { SensorDAO } from "./SensorDAO";

@Entity("measurement")
export class MeasurementDAO {
  @PrimaryColumn({nullable: false})
  id: number;

  @Column({nullable: false})
  createdAt: Date; 

  @Column("float" ,{nullable: false})
  value: number; 

  @Column({nullable: false})
  isOutlier: boolean; // Indica se è un valore anomalo

 // @ManyToOne(() => SensorDAO, (sensor) => sensor.measurements, { onDelete: "CASCADE" })
//  sensor: SensorDAO; 
  // Relazione univoca con il sensore
  // onDelete: "CASCADE" per eliminare le misurazioni associate quando un sensore viene eliminato
  
}