# Project Estimation

Date: 16/04/2025

Version: 1.0

# Estimation approach

Consider the GeoControl project as described in the swagger, assume that you are going to develop the project INDEPENDENT of the deadlines of the course, and from scratch

# Estimate by size

###

|                                                                                                         | Estimate       |
| ------------------------------------------------------------------------------------------------------- | -------------- |
| NC = Estimated number of classes to be developed                                                        | 8              |
| A = Estimated average size per class, in LOC                                                            | 250            |
| S = Estimated size of project, in LOC (= NC \* A)                                                       | 2000           |
| E = Estimated effort, in person hours (here use productivity 10 LOC per person hour)                    | 200            |
| C = Estimated cost, in euro (here use 1 person hour cost = 30 euro)                                     | 6.000 €        |
| Estimated calendar time, in calendar weeks (Assume team of 4 people, 8 hours per day, 5 days per week ) | 200/160 = 1,25 |

Abbiamo stimato di dover implementare 8 classi principali: Network, Gateway, Sensor, User, Measurement, Measurements (contenitore di più Measurement), Statistic, ErrorDTO.
Saranno da implementare anche le classi Token e UserType, ma essendo molto più semplici (in termini di linee di codice) delle altre non riteniamo che influiscano significativamente sulla stima.

# Estimate by product decomposition

Dato che confronteremo i risultati dei tre approcci, manteniamo per le prossime stime l'assunzione di avere un team di 4 persone che lavora al progetto 8 ore al giorno per 5 giorni a settimana. Il progetto viene fatto a partire da zero.
Abbiamo quindi un massimo di person hour settimanali di 160.

###

| component name       | Estimated effort (person hours) |
| -------------------- | ------------------------------- |
| requirement document | 200                             |
| design document      | 100                             |
| code                 | 250                             |
| unit tests           | 150                             |
| api tests            | 200                             |
| management documents | 50                              |

###

Ipotizziamo di avere una scala di difficoltà da 1 a 5 per la creazione di ogni componente. Associamo ad ogni punto di difficoltà 50 person hour.

# Estimate by activity decomposition

###

| Activity name                  | Estimated effort (person hours) |
| ------------------------------ | ------------------------------- |
| Business Model & Stakeholders  | 20                              |
| Context Diagram                | 10                              |
| Interfacce e Persone           | 20                              |
| Analisi dei Requisiti          | 80                              |
| Use Cases                      | 120                             |
| Glossario                      | 10                              |
| System Design                  | 20                              |
| Deployment Diagram             | 20                              |
| Estimations                    | 30                              |
| Definizione Database           | 60                              |
| Sviluppo Codice                | 200                             |
| Scrittura dei Test             | 100                             |
| Unit Testing                   | 80                              |
| Integration Testing            | 120                             |
| Containerizzazione del Sistema | 150                             |
| Sostituzione SQlite con mySQL  | 60                              |
| Creazione docker               | 100                             |

###

Insert here Gantt chart with above activities
![Diagramma di Gantt](./images/Diagramma%20di%20Gantt%20di%20base.png)

# Summary

Report here the results of the three estimation approaches. The estimates may differ. Discuss here the possible reasons for the difference

|                                    | Estimated effort | Estimated duration |
| ---------------------------------- | ---------------- | ------------------ |
| estimate by size                   | 200              | ~ 1,25 settimane   |
| estimate by product decomposition  | 950              | ~ 6 settimane      |
| estimate by activity decomposition | 1200             | ~ 7,5 settimane    |

La differenza tra la prima stima e le altre è data dal fatto che stimare la durata di un progetto solo in base alle LOC è un approccio molto riduttivo, tuttavia 200 person hour sembrano un risultato realistico per quanto riguarda la fase di "Sviluppo Codice" e per questo si è deciso di adottarla all'interno della decomposizione per attività.
