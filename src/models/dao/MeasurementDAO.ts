import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { SensorDAO } from "./SensorDAO";

@Entity("measurement")
export class MeasurementDAO {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({nullable: false})
  createdAt: Date; 

  @Column("float" ,{nullable: false})
  value: number; 

  @Column({nullable: true})
  isOutlier: boolean; // Indica se è un valore anomalo

  @ManyToOne(() => SensorDAO, (sensor) => sensor.measurements, { nullable: false, onDelete: "CASCADE" })
  sensor: SensorDAO; 
  // Relazione univoca con il sensore
  // onDelete: "CASCADE" per eliminare le misurazioni associate quando un sensore viene eliminato
  
}
