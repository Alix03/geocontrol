# Requirements Document - GeoControl

Date:

Version: V1 - description of Geocontrol as described in the swagger

| Version number | Change |
| :------------: | :----: |
|                |        |

# Contents

- [Requirements Document - GeoControl](#requirements-document---geocontrol)
- [Contents](#contents)
- [Informal description](#informal-description)
- [Business model](#business-model)
- [Stakeholders](#stakeholders)
- [Context Diagram and interfaces](#context-diagram-and-interfaces)
  - [Context Diagram](#context-diagram)
  - [Interfaces](#interfaces)
- [Stories and personas](#stories-and-personas)
- [Functional and non functional requirements](#functional-and-non-functional-requirements)
  - [Functional Requirements](#functional-requirements)
  - [Non Functional Requirements](#non-functional-requirements)
- [Use case diagram and use cases](#use-case-diagram-and-use-cases)
  - [Use case diagram](#use-case-diagram)
    - [Use case 1, UC1](#use-case-1-uc1)
      - [Scenario 1.1](#scenario-11)
      - [Scenario 1.2](#scenario-12)
      - [Scenario 1.x](#scenario-1x)
    - [Use case 2, UC2](#use-case-2-uc2)
    - [Use case x, UCx](#use-case-x-ucx)
- [Glossary](#glossary)
- [System Design](#system-design)
- [Deployment Diagram](#deployment-diagram)

# Informal description

GeoControl is a software system designed for monitoring physical and environmental variables in various contexts: from hydrogeological analyses of mountain areas to the surveillance of historical buildings, and even the control of internal parameters (such as temperature or lighting) in residential or working environments.

# Business Model

Per rendere il sistema sostenibile e scalabile, la soluzione scelta è stata quella di combinare Public-Private Partnership (PPP), SaaS e Vendita Diretta.
In questo modo, si copre il finanziamento iniziale con fondi pubblici e si garantiscono entrate continue con il SaaS, lasciando ai clienti la scelta tra acquistare o noleggiare i sensori.

1 Fase Iniziale: Finanziamento Pubblico (PPP)

L’Unione delle Comunità Montane del Piemonte finanzia lo sviluppo iniziale.
In cambio, l’ente pubblico riceve una licenza perpetua per l’uso del software.
Il progetto nasce senza rischio finanziario per GeoControl.

2 Fase di Espansione: SaaS + Vendita Diretta

I clienti pagano un abbonamento che include l’acquisizione dei sensori e gateway direttamente.

# Stakeholders

|                              Stakeholder name                              |                                              Description                                               |
| :------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------: |
|                               UNCEM Piemonte                               |     Committente, in quanto interessata alla gestione dello stato idrogeologico dei suoi territori      |
| Entità pubbliche che richiedono monitoraggio continuo dei parametri fisici |         Gestione delle analisi idrogeologiche delle aree o sorveglianza degli edifici storici          |
|  Entità private che richiedono monitoraggio continuo dei parametri fisici  | Controllo dei parametri interni (come temperatura o luminosità) in ambienti residenziali o industriali |
|                       Fornitori di gateway e sensori                       |                        Forniscono i dispositivi fisici che geocontrol utilizza                         |
|                                Competitors                                 |                    Implicato nel fornire soluzioni nella stessa nicchia di mercato                     |
|                             Geocontrol office                              |                   Responsabili per il design, la gestione e lo sviluppo del sistema                    |
|                      Residenti nelle aree monitorate                       |              Beneficiano indirettamente del monitoraggio del territorio di cui risiedono               |
|                           Servizio di pagamento                            |        Offre il servizio per gestire le transazioni per l'acquisto delle license e del servizio        |

# Context Diagram and interfaces

## Context Diagram

![Context diagram](./images/Context.png)

Admin e operator appartengono al Geocontrol Office.
I viewer rappresentano i clienti che usufruiscono del servizio(UNCEM Piemonte, entità pubbliche e private)

## Interfaces

\<describe here each interface in the context diagram>

|         Actor         |                Logical Interface                |                Physical Interface                 |
| :-------------------: | :---------------------------------------------: | :-----------------------------------------------: |
|      Actor Admin      | Graphical User Interface command line interface |                 Screen, Keyboard                  |
|    Actor Operator     | Graphical User Interface command line interface |                 Screen, Keyboard                  |
|     Actor Viewer      |                    GUI, API                     | Screen, Keyboard , Internet Connection (via APIs) |
| Actor Gateway/sensor  |              API per l'invio dati               |          Internet Connection (via APIs)           |
| Servizio di pagamento |                       API                       |               Connessione internet                |

# Stories and personas

Persona1: lavoratore presso UNCEM, laureato in geologia, 35.
Storia: Lavora presso UNCEM e utilizza GeoControl per monitorare il rischio idrogeologico nelle valli alpine. Necessita dati costantemente aggiornati per il monitoraggio dei corsi d'acqua.

Persona2: storica d'arte, lavora presso una fondazione privata che si occupa della conservazione di edifici storici.
Storia: Necessita di segnalazioni occasionali ma tempestive in caso di anomalie strutturali che superino dei valori di soglia.

Persona3: tecnico del Comune.
Storia: Usufruisce dei servizi per monitorare il funzionamento dell'illuminazione pubblica. Non ha esperienze pregresse riguardo l'utilizzo di apparati informatici; ha bisogno di un'interfaccia intuitiva e semplice da utilizzare.

Persona4: lavoratore presso un'azienda agricola.
Storia: Sfrutta i servizi di monitoraggio per mantenere costanti temperatura, umidità e illuminazione per le serre. Uitlizza un server, che riceve i dati da GeoControl via API

# Functional and non functional requirements

## Functional Requirements

|                       ID                       |                                                                             Description                                                                             |
| :--------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|      FR1 Autenticazione e gestione utenti      | Login con credenziali (username e password). Generazione e gestione di token per l’autenticazione. Tre ruoli utente con permessi distinti: Admin, Operator, Viewer. |
|                  FR1.1 Login                   |                                                          Sistema richiede credenziali di accesso (user/pw)                                                          |
|           FR1.1.1 Generazione Token            |                                             Generazione del token da includere nell'header per le richieste successive                                              |
|                  FR1.2 Logout                  |                                                                     L'account viene scollegato                                                                      |
|            FR 1.3 Gestione Account             |                                                           Account viene creato, monitorato e/o eliminato                                                            |
|           FR1.3.1 Creazione Account            |                                                                  Account dell'utente viene creato                                                                   |
|           FR 1.3.2 Rimozione Account           |                                                                        Account viene rimosso                                                                        |
|           FR 1.3.3 Modifica Account            |                                                                      Account viene modificato                                                                       |
|          FR 1.3.4 Assegnazione Ruolo           |                                     Assegnazione dell'account ad un ruolo tra Admin, Operator e Viewer (definizione permessi?)                                      |
|          FR2 Gestione della topologia          |                                                 Creazione, aggiornamento, eliminazione di reti, gateway e sensori.                                                  |
|            FR2.1 Creazione Network             |                                                                    Creazione di un nuovo network                                                                    |
|            FR2.1.1 Assegnazione ID             |                                                             Associazione del network al suo ID univoco                                                              |
|           FR2.2 Eliminazione Network           |                                                                       Rimozione di un network                                                                       |
|             FR2.3 Modifica Network             |                                                                 Aggiunta e rimozione di un gateway                                                                  |
|         FR2.3.1 Creazione del Gateway          |                                                                    Creazione di un nuovo Gateway                                                                    |
|      FR2.3.2 Assegnazione MAC al Gateway       |                                                                 Assegnazione del Gateway al suo MAC                                                                 |
|        FR2.3.3 Eliminazione del Gateway        |                                                                      Eliminazione del Gateway                                                                       |
|     FR2.3.4 Aggiunta del Gateway a Network     |                                                               Associazione del gateway al suo network                                                               |
|    FR2.3.5 Rimozione del Gateway a Network     |                                                                Rimozione di un gateway da un network                                                                |
|             FR2.4 Modifica Gateway             |                                                      Creazione, rimozione e associazione di sensore al gateway                                                      |
|           FR2.4.1 Creazione sensore            |                                                                    Creazione di un nuovo sensore                                                                    |
|     FR2.4.1.1 Assegnazione MAC al sensore      |                                                                 Assegnazione del sensore al suo MAC                                                                 |
|          FR2.4.2 Eliminazione sensore          |                                                                     Eliminazione di un sensore                                                                      |
|      FR2.4.3 Aggiunta sensore al Gateway       |                                                              Associazione di un sensore al suo gateway                                                              |
|      FR2.4.4 Rimozione Sensor dal Gateway      |                                                                Rimozione di un sensore da un gateway                                                                |
| FR3 Raccolta e archiviazione delle misurazioni |                                                        Acquisizione dei dati dai sensori. Archiviazione dati                                                        |
|  FR4 Analisi dei dati e rilevamento anomalie   |                                  Calcolo della media (μ) e varianza (σ²) delle misurazioni. Identificazione di outlier con soglie.                                  |
|               F5 Accesso ai dati               |                                                    Consultazione delle misure da parte degli utenti autorizzati.                                                    |

## Non Functional Requirements

\<Describe constraints on functional requirements>

|  ID  | Type (efficiency, reliability, ..) |                                                                                                     Description                                                                                                      | Refers to |
| :--: | :--------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-------: |
| NFR1 |            Affidabilità            | Non più di 6 misurazioni perse per sensore all’anno. Meccanismi di ritrasmissione in caso di errore nella ricezione dati. Il sistema deve supportare più reti e numerosi dispositivi senza degradare le prestazioni. |           |
| NFR2 |             Sicurezza              |                                                         Accesso regolato tramite autenticazione e autorizzazione. Comunicazione sicura tra gateway e server.                                                         |           |
| NFR3 |            Portability             |                                                                       Compatibilità con diversi tipi di sensori e protocolli di comunicazione.                                                                       |           |
| NF4  |             Efficiency             |                                                                                  Acquisizione dei dati dai sensori ogni 10 minuti.                                                                                   |           |
| NF5  |            Manutenzione            |                                                          Minimizzazione dello sforzo nella modifica del software e nella correzione di anomalie di sistema                                                           |           |

# Use case diagram and use cases

## Use case diagram

\<define here UML Use case diagram UCD summarizing all use cases, and their relationships>

\<next describe here each use case in the UCD>

### Use case 1, UC1

| Actors Involved  |                                                                      |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | \<Boolean expression, must evaluate to true before the UC can start> |
|  Post condition  |  \<Boolean expression, must evaluate to true after UC is finished>   |
| Nominal Scenario |         \<Textual description of actions executed by the UC>         |
|     Variants     |                      \<other normal executions>                      |
|    Exceptions    |                        \<exceptions, errors >                        |

##### Scenario 1.1

\<describe here scenarios instances of UC1>

\<a scenario is a sequence of steps that corresponds to a particular execution of one use case>

\<a scenario is a more formal description of a story>

\<only relevant scenarios should be described>

|  Scenario 1.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | \<Boolean expression, must evaluate to true before the scenario can start> |
| Post condition |  \<Boolean expression, must evaluate to true after scenario is finished>   |
|     Step#      |                                Description                                 |
|       1        |                                                                            |
|       2        |                                                                            |
|      ...       |                                                                            |

##### Scenario 1.2

##### Scenario 1.x

### Use case 2, UC2

..

### Use case x, UCx

..

# Glossary

\<use UML class diagram to define important terms, or concepts in the domain of the application, and their relationships>

\<concepts must be used consistently all over the document, ex in use cases, requirements etc>

# System Design

\<describe here system design>

\<must be consistent with Context diagram>

# Deployment Diagram

\<describe here deployment diagram >
