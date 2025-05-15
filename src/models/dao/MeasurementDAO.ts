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

  @Column({nullable: true})
  isOutlier: boolean; // Indica se è un valore anomalo

<<<<<<< Updated upstream
  @ManyToOne(() => SensorDAO, (sensor) => sensor.measurements, { onDelete: "CASCADE" })
=======
  @ManyToOne(() => SensorDAO, (sensor) => sensor.measurement, { nullable: false, onDelete: "CASCADE" })
>>>>>>> Stashed changes
  sensor: SensorDAO; 
  // Relazione univoca con il sensore
  // onDelete: "CASCADE" per eliminare le misurazioni associate quando un sensore viene eliminato
  
}