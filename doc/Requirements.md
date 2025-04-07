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
|      **FR1**      | **Autenticazione e gestione utenti** |
|                  FR1.1                   |                                                          Login|
|FR1.1.1| Rilascio token di accesso|
|                  FR1.2                   |      Logout                                                                                                                            |
|            FR1.3              |    Gestione Account (Admin, Operator, Viewer)                                                                                                                 |
|           FR1.3.1             | Creazione Account e assegnazione ruolo (Admin, Operator, Viewer)                                              |
|           FR1.3.2            |          Rimozione Account                                                                     |
|           FR1.3.3            |       Modifica Account                                                                                    |
|          FR1.3.4        |     Visualizzazione Account         specifico
|FR1.3.5| Visualizzazione elenco account|                         |
|          **FR2**          |     **Gestione Topologia**                                                   |
|            FR2.1          |      Gestione Network                                                                 |
|FR2.1.1| Creazione Network|
|FR2.1.2| Modifica Network|
|FR2.1.3| Eliminazione Network|
|FR2.1.4| Visualizzazione di tutti i Network|
|FR2.1.5| Visualizzazione di un Network specifico|
|FR2.2| Gestione Gateway|
|FR2.2.1| Creazione Gateway|
|FR2.2.2| Modifica Gateway|
|FR2.2.3| Eliminazione Gateway|
|FR2.2.4| Visualizzazione di un Gateway specifico|
|FR2.2.5| Visualizzazione di tutti i Gateway associati a un  Network specifico|
|FR2.3| Gestione Sensore|
|FR2.3.1| Creazione Sensore|
|FR2.3.2| Modifica Sensore|
|FR2.3.3| Eliminazione Sensore|
|FR2.3.4| Visualizzazione Sensore specifico|
|FR2.3.5| Visualizzazione di tutti i Sensori associati a un Gateway specifico |
|FR2.4| Associazioni|
|FR2.4.1|Aggiunta del Gateway a Network|
|FR2.4.2|Rimozione del Gateway da Network|
|FR2.4.3|Aggiunta sensore al Gateway|
|FR2.4.4|Rimozione sensore dal Gateway|
|FR2.4.5|Aggiunta associazione tra Gateway|
|FR2.4.6|Rimozione associazione tra Gateway||
| **FR3**  |         **Gestione          Misurazioni**                          |
|FR3.1  | Raccolta delle misurazioni trasmesse dai gateway |
|FR3.1.1 | Associazione della misurazione al corrispondente sensore|
|FR3.1.2 | Conversione dal timestamp locale del sensore a UTC |
|FR3.2  | Archiviazione dei dati convertiti nel sistema |
|FR3.3| Visualizzazione misurazioni|
|FR3.3.1| Visualizzazione misurazioni per un insieme di sensori di un Network specifico |
|FR3.3.2|Visualizzazione misurazioni per un Sensore specifico|
|FR3.4|Inserimento misurazioni|
|FR3.5| Conversione timestamp da UTC a orario locale del viewer|
|  **FR4**   |                        **Analisi dei dati e rilevamento anomalie** |
|FR4.1 | Calcolo della media delle misurazioni in un dato intervallo temporale|
|FR4.2 | Calcolo della varianza delle misurazioni in un dato intervallo temporale|
|FR4.3  | Calcolo delle soglie (superiore e inferiore) per identificare potenziali valori anomali|
|FR4.3.1  |Calcolo sogliaSuperiore = μ + 2σ
|FR4.3.2  | Calcolo sogliaInferiore = μ - 2σ|
|FR4.4 | Identificazione outlier |
|FR4.5|Visualizzazione statistiche|
|FR4.5.1| Visualizzazione statistiche per un insieme di Sensori di un Network specifico|
|FR4.5.2|Visualizzazione statistiche per uno specifico sensore|
|FR4.5.3| Visualizzazione outliers per un insieme di Sensori di un Network specifico |
|FR4.5.4|Visualizzazione outliers per uno specifico sensore |


## Non Functional Requirements

\<Describe constraints on functional requirements>

|  ID  | Type (efficiency, reliability, ..) |                                                                                                     Description                                                                                                      | Refers to |
| :--: | :--------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-------: |
| NFR1 | Affidabilità | Non più di 6 misurazioni perse per sensore all’anno | FR3 |
| NFR2 | Affidabilità | Implementazione di meccanismi di ritrasmissione automatica in caso di errore nella ricezione dei dati | FR3 |
| NFR3 | Prestazioni | Il sistema deve garantire prestazioni stabili anche in presenza di molteplici reti e dispositivi | FR3 |
| NFR4 | Sicurezza | L’accesso al sistema deve essere regolato tramite autenticazione e autorizzazione basata su ruoli | FR1 |
| NFR5 | Sicurezza | La comunicazione tra gateway e server deve avvenire su canali sicuri  | FR1 |
| NFR6 | Portabilità | Compatibilità con diversi modelli di sensori e protocolli di comunicazione, senza necessità di modifiche sostanziali al software. | FR2, FR3 |
| NFR7 | Efficienza | Acquisizione e registrazione dei dati dei sensori ogni 10 minuti. | FR3.1 |
| NFR8 | Manutenibilità | Il sistema deve essere modulare e facilmente estendibile, consentendo interventi di aggiornamento o correzione senza compromettere il funzionamento globale. | Tutti |

# Use case diagram and use cases

## Use case diagram

\<define here UML Use case diagram UCD summarizing all use cases, and their relationships>

\<next describe here each use case in the UCD>

### Use Case 10, Creazione Network (UC10)

| Actors Involved  |           Admin, Operator            |
| :--------------: | :----------------------------------: |
|   Precondition   |       Utente autenticato con token      |
|  Post condition  |     La rete è creata nel sistema     |
| Nominal Scenario |            Scenario 10.1             |
|     Variants     |                None                  |
|    Exceptions    |     Scenario 10.2, Scenario 10.3, Scenario 10.4, Scenario 10.5, Scenario 10.6     |

#### Scenario 10.1

|  Scenario 10.1  |                               Creazione rete con successo `(Code 201)`                               |
| :-------------: | :---------------------------------------------------------------------------------------: |
|  Precondition   |                           Utente autenticato come Admin o Operator                           |
| Post condition  |                      Rete registrata e visibile nel sistema                          |
|     Step#       |                                    Description                                            |
|        1        |                      Utente accede alla sezione "Gestione Reti" dell’interfaccia               |
|        2        |                                Utente seleziona "Crea nuova rete"                              |
|        3        |      Utente inserisce `code`, `name`, `description` nel modulo (es. NET01, Alp Monitor, ...)   |
|        4        |                                Utente invia il modulo di creazione                             |
|        5        |        Il sistema valida i dati, non restituisce nessun errore. Registra la rete e restituisce `201 Created`   |
#### Scenario 10.2

|  Scenario 10.2  |                            Dati mancanti o input non valido `(400 Invalid input data )`                          |
| :-------------: | :----------------------------------------------------------------------------------------: |
|  Precondition   |               Utente autenticato ma il modulo è incompleto o malformato                      |
| Post condition  |                             Nessuna rete viene creata                                     |
|     Step#       |                                    Description                                             |
|        1        | Utente apre il modulo ma omette il campo obbligatorio `code`                                   |
|        2        | Utente invia il modulo di creazione                                                      |
|        3        | Il sistema valida i dati, rileva la mancanza del campo `code` e restituisce il codice di errore `400 Bad Request`|


#### Scenario 10.3

|  Scenario 10.3  |                       Token assente o non valido `401 Unauthorized`                     |
| :-------------: | :----------------------------------------------------------------------------------------: |
|  Precondition   | L'Utente non ha effettuato il login oppure il token è assente, scaduto o malformato          |
| Post condition  | Nessuna rete viene creata                                                                 |
|     Step#       | Description                                                                                |
|        1        | L'utente tenta di inviare una richiesta  per creare una rete                                 |
|        2        | La richiesta è priva di header `Authorization` oppure il token ha un formato non valido   |
|        3        | Il sistema intercetta la richiesta, verifica il token e lo considera invalido                 |
|        4        | Il sistema restituisce il codice di errore `401 Unauthorized`   |


#### Scenario 10.4

|  Scenario 10.4  |                        Ruolo non autorizzato `(403 Forbidden)`                                 |
| :-------------: | :----------------------------------------------------------------------------------------: |
|  Precondition   | L'utente è autenticato correttamente con un token valido, ma ha ruolo Viewer                     |
| Post condition  | Nessuna rete viene creata                                                                 |
|     Step#       | Description                                                                                |
|        1        | L'utente  accede all’interfaccia come Viewer e apre il modulo “Crea nuova rete”                   |
|        2        | L'utente compila i campi e invia la richiesta per la creazione di una nuova rete                                                |
|        3        | Il sistema verifica che il token è valido                                                    |
|        4        | Il sistema controlla il ruolo utente e rileva i permessi insufficienti                         |
|        5        | Il sistama restituisce il codice di errore `(403 Forbidden)`              |

#### Scenario 10.5

|  Scenario 10.5 |                          Codice rete già esistente `(409 Confict)`                        |
| :-------------: | :----------------------------------------------------------------------------------------: |
|  Precondition   |                  Utente autenticato, ma il codice inserito è già registrato                  |
| Post condition  |                             Nessuna rete viene creata                                     |
|     Step#       |                                    Description                                             |
|        1        | Utente compila il modulo con un codice già esistente                                  |
|        2        | Utente  invia il modulo di creazione                                                    |
|        3        | Il sistema valida i dati, rileva la duplicazione e restituisce il codice di errore `(409 Confict)`|

#### Scenario 10.5

|  Scenario 10.6  |                                Errore interno del server `(500 Internal Server Error)`                             |
| :-------------: | :----------------------------------------------------------------------------------------: |
|  Precondition   | L’utente è autenticato, ma si verifica un errore inatteso lato server                     |
| Post condition  | Nessuna rete viene creata                                                                 |
|     Step#       | Description                                                                                |
|        1        | L'utente compila il modulo correttamente e invia la richiesta                                    |
|        2        | Durante l'elaborazione della richiesta si verifica un errore imprevisto lato server. |
|        3        | Il sistema restituisce il codice di errore `(500 Internal Server Error)`     ||
# Glossary

\<use UML class diagram to define important terms, or concepts in the domain of the application, and their relationships>

\<concepts must be used consistently all over the document, ex in use cases, requirements etc>

# System Design

\<describe here system design>

\<must be consistent with Context diagram>

# Deployment Diagram

\<describe here deployment diagram >
