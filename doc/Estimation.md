# Project Estimation

Date: 16/04/2025

Version: 1.0

# Estimation approach

Consider the GeoControl project as described in the swagger, assume that you are going to develop the project INDEPENDENT of the deadlines of the course, and from scratch

# Estimate by size

###

|                                                                                                         | Estimate       |
| ------------------------------------------------------------------------------------------------------- | -------------- |
| NC = Estimated number of classes to be developed                                                        | 13             |
| A = Estimated average size per class, in LOC                                                            | 150            |
| S = Estimated size of project, in LOC (= NC \* A)                                                       | 1.950          |
| E = Estimated effort, in person hours (here use productivity 10 LOC per person hour)                    | 195            |
| C = Estimated cost, in euro (here use 1 person hour cost = 30 euro)                                     | 5.850          |
| Estimated calendar time, in calendar weeks (Assume team of 4 people, 8 hours per day, 5 days per week ) | 195/160 = 1,22 |

Abbiamo stimato di dover implementare 13 classi: Network, Gateway, Sensor, User, Measurement, Statistic, daoNetwork, daoGateway, daoSensor, daoUser, daoMeasurement, daoStatistic e ErrorMessage.

# Estimate by product decomposition

Dato che confronteremo i risultati dei tre approcci, manteniamo per le prossime stime l'assunzione di avere un team di 4 persone che lavora al progetto 8 ore al giorno per 5 giorni a settimana. Il progetto viene fatto a partire da zero.
Abbiamo quindi un massimo di person hour settimanali di 160.

###

| component name       | Estimated effort (person hours) |
| -------------------- | ------------------------------- |
| requirement document |                                 |
| design document      |                                 |
| code                 |                                 |
| unit tests           |                                 |
| api tests            |                                 |
| management documents |                                 |

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
| Definizione Database           | 40                              |
| Sviluppo Codice                | 200                             |
| Scrittura dei Test             | 100                             |
| Unit Testing                   | 60                              |
| Integration Testing            | 100                             |
| Containerizzazione del Sistema | 150                             |
| Sostituzione SQlite con mySQL  | 40                              |
| Creazione docker               | 80                              |

###

Insert here Gantt chart with above activities
![Diagramma di Gantt](<./images/Diagramma%20di%20Gantt%20di%20base%20(4).png>)

![Diagramma di Gantt](<./images/Diagramma%20di%20Gantt%20di%20base%20(6).png>)

# Summary

Report here the results of the three estimation approaches. The estimates may differ. Discuss here the possible reasons for the difference

|                                    | Estimated effort | Estimated duration |
| ---------------------------------- | ---------------- | ------------------ |
| estimate by size                   | 175 ph           | ~ 1,2 settimane    |
| estimate by product decomposition  |                  |                    |
| estimate by activity decomposition | 1100             | ~ 8 settimane      |
