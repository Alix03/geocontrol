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

|    ID     | Description                                                                             |
| :-------: | --------------------------------------------------------------------------------------- |
|  **FR1**  | **Autenticazione e gestione utenti**                                                    |
|   FR1.1   | Login                                                                                   |
|   FR1.2   | Creazione Account                                                                       |
|   FR1.3   | Rimozione Account                                                                       |
|   FR1.4   | Visualizzazione Elenco Account                                                          |
|  FR1.4.1  | Visualizza Specifico Account                                                            |
|  **FR2**  | **Gestione Topologia**                                                                  |
|   FR2.1   | Gestione Network                                                                        |
|  FR2.1.1  | Creazione Network                                                                       |
|  FR2.1.2  | Modifica Network                                                                        |
|  FR2.1.3  | Eliminazione Network                                                                    |
|  FR2.1.4  | Visualizzazione di tutti i Network                                                      |
| FR2.1.4.1 | Visualizzazione di un Network specifico                                                 |
|   FR2.2   | Gestione Gateway                                                                        |
|  FR2.2.1  | Creazione Gateway                                                                       |
|  FR2.2.2  | Modifica Gateway                                                                        |
|  FR2.2.3  | Eliminazione Gateway                                                                    |
|  FR2.2.4  | Visualizzazione di un Gateway specifico                                                 |
| FR2.2.4.1 | Visualizzazione di tutti i Gateway associati a un Network specifico                     |
|   FR2.3   | Gestione Sensore                                                                        |
|  FR2.3.1  | Creazione Sensore                                                                       |
|  FR2.3.2  | Modifica Sensore                                                                        |
|  FR2.3.3  | Eliminazione Sensore                                                                    |
|  FR2.3.4  | Visualizzazione Sensore specifico                                                       |
| FR2.3.4.1 | Visualizzazione di tutti i Sensori associati a un Gateway specifico                     |
|   FR2.4   | Associazioni                                                                            |
|  FR2.4.1  | Aggiunta del Gateway a Network (contestuale alla creazione gateway)                     |
|  FR2.4.2  | Rimozione del Gateway da Network (non c'è)                                              |
|  FR2.4.3  | Aggiunta sensore al Gateway (contestuale alla creazione sensore)                        |
|  FR2.4.4  | Rimozione sensore dal Gateway (non c'è)                                                 |
|  **FR3**  | **Gestione Misurazioni**                                                                |
|   FR3.1   | Conversione timestamp                                                                   |
|  FR3.1.1  | Conversione timestamp da orario locale a UTC                                            |
|  FR3.1.2  | Conversione timestamp da UTC a orario locale                                            |
|   FR3.2   | Visualizzazione misurazioni                                                             |
|  FR3.2.1  | Visualizzazione misurazioni di un network                                               |
|  FR3.2.2  | Visualizzazione filtrata misurazioni di un network                                      |
|   FR3.3   | Inserimento misurazioni                                                                 |
|  **FR4**  | **Analisi dei dati e rilevamento anomalie**                                             |
|   FR4.1   | Calcolo della media delle misurazioni in un dato intervallo temporale                   |
|   FR4.2   | Calcolo della varianza delle misurazioni in un dato intervallo temporale                |
|   FR4.3   | Calcolo delle soglie (superiore e inferiore) per identificare potenziali valori anomali |
|  FR4.3.1  | Calcolo sogliaSuperiore = μ + 2σ                                                        |
|  FR4.3.2  | Calcolo sogliaInferiore = μ - 2σ                                                        |
|   FR4.4   | Identificazione outlier                                                                 |
|   FR4.5   | Visualizzazione statistiche                                                             |
|  FR4.5.1  | Visualizzazione statistiche per un insieme di Sensori di un Network specifico           |
|  FR4.5.2  | Visualizzazione statistiche per uno specifico sensore                                   |
|  FR4.5.3  | Visualizzazione outliers per un insieme di Sensori di un Network specifico              |
|  FR4.5.4  | Visualizzazione outliers per uno specifico sensore                                      |
|  **FR5**  | **Gestione Errori**                                                                     |
|   FR5.1   | E400- Invalid input data                                                                |
|   FR5.2   | E401- Unauthorized                                                                      |
|   FR5.3   | E403- Insufficient rights                                                               |
|   FR5.4   | E409- Network code already in use                                                       |
|   FR5.5   | E500- Internal server error                                                             |

## Non Functional Requirements

\<Describe constraints on functional requirements>

|  ID  | Type (efficiency, reliability, ..) |                                                                         Description                                                                          | Refers to |
| :--: | :--------------------------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------: | :-------: |
| NFR1 |            Affidabilità            |                                                     Non più di 6 misurazioni perse per sensore all’anno                                                      |    FR3    |
| NFR2 |            Affidabilità            |                            Implementazione di meccanismi di ritrasmissione automatica in caso di errore nella ricezione dei dati                             |    FR3    |
| NFR3 |            Prestazioni             |                               Il sistema deve garantire prestazioni stabili anche in presenza di molteplici reti e dispositivi                               |    FR3    |
| NFR4 |             Sicurezza              |                              L’accesso al sistema deve essere regolato tramite autenticazione e autorizzazione basata su ruoli                               |    FR1    |
| NFR5 |             Sicurezza              |                                             La comunicazione tra gateway e server deve avvenire su canali sicuri                                             |    FR1    |
| NFR6 |            Portabilità             |              Compatibilità con diversi modelli di sensori e protocolli di comunicazione, senza necessità di modifiche sostanziali al software.               | FR2, FR3  |
| NFR7 |             Efficienza             |                                              Acquisizione e registrazione dei dati dei sensori ogni 10 minuti.                                               |   FR3.1   |
| NFR8 |           Manutenibilità           | Il sistema deve essere modulare e facilmente estendibile, consentendo interventi di aggiornamento o correzione senza compromettere il funzionamento globale. |   Tutti   |

# Use case diagram and use cases

## Use case diagram

\<define here UML Use case diagram UCD summarizing all use cases, and their relationships>

\<next describe here each use case in the UCD>

### Use Case 1, Login (UC10)

| Actors Involved  |           User           |
| :--------------: | :----------------------: |
|   Precondition   | L'utente U non è loggato |
|  Post condition  |   L'utente U è loggato   |
| Nominal Scenario |       Scenario 1.1       |
|     Variants     |         Nessuna          |
|    Exceptions    |  Scenario 1.2, 1.3, 1.4  |

#### Scenario 1.1

|  Scenario 1.1  |                                        Login riuscito `(Code 200)`                                        |
| :------------: | :-------------------------------------------------------------------------------------------------------: |
|  Precondition  |                                              U è registrato                                               |
| Post condition |                                                U è loggato                                                |
|     Step#      |                                                Descrizione                                                |
|       1        |                                  Sistema: Chiede `username`, `password`.                                  |
|       2        |                                  User: Inserisce `username`, `password`.                                  |
|       3        |                                      Sistema: Legge i dati inseriti.                                      |
|       4        |                               Sistema: Dato il nome utente, cerca l’utente.                               |
|       5        | Sistema: Recupera la password, la confronta con quella fornita. I dati coincidono, l’utente è autorizzato |
|       6        |                         Sistema: Associa allo user un token di accesso temporaneo                         |

#### Scenario 1.2

|  Scenario 1.2  |                                       Password/Username errati `(Code 401)`                                       |
| :------------: | :---------------------------------------------------------------------------------------------------------------: |
|  Precondition  |                                                  U è registrato                                                   |
| Post condition |                                                  U non è loggato                                                  |
|     Step#      |                                                    Descrizione                                                    |
|       1        |                                      Sistema: Chiede `username`, `password`.                                      |
|       2        |                                      User: Inserisce `username`, `password`.                                      |
|       3        |                                          Sistema: Legge i dati inseriti.                                          |
|       4        |                                   Sistema: Dato il nome utente, cerca l’utente.                                   |
|       5        | Sistema: Recupera la password, la confronta con quella fornita. I dati non coincidono, l’utente non è autorizzato |
|       6        |                                 Sistema: mostra a schermo un messaggio di errore                                  |

#### Scenario 1.3

| Scenario 1.3   |                         L'utente non è registrato `(Code 404)`                          |
| -------------- | :-------------------------------------------------------------------------------------: |
| Precondition   |                                   U non è registrato                                    |
| Post condition |                                     U non è loggato                                     |
| Step#          |                                       Descrizione                                       |
| 1              |                         Sistema: Chiede `username`, `password`.                         |
| 2              |                         User: Inserisce `username`, `password`.                         |
| 3              |                             Sistema: Legge i dati inseriti.                             |
| 4              | Sistema: Cerca l’utente dato il nome utente. Utente non trovato. Utente non autorizzato |
| 5              |                    Sistema: mostra a schermo un messaggio di errore                     |

### Use Case 2, Creazione Account (UC3)

| Actors Involved  |            Admin             |
| :--------------: | :--------------------------: |
|   Precondition   | L'utente U non ha un account |
|  Post condition  |       User registrato        |
| Nominal Scenario |         Scenario 2.1         |
|     Variants     |           Nessuna            |
|    Exceptions    | Scenario 2.2, 2.3, 2.4, 2.5  |

#### Scenario 2.1

|  Scenario 2.1  |                                                     Registrazione `(Code 201)`                                                     |
| :------------: | :--------------------------------------------------------------------------------------------------------------------------------: |
|  Precondition  |                                                        U non ha un account                                                         |
| Post condition |                                                            U registrato                                                            |
|     Step#      |                                                            Descrizione                                                             |
|       1        |                                             Admin: Clicca il pulsante di registrazione                                             |
|       2        |                                  Sistema: Verifica la presenza di un token valido nella richiesta                                  |
|       3        |                                               Sistema: Rileva che il token è valido                                                |
|       4        |                                          Sistema: Chiede `username`, `password`, `ruolo`                                           |
|       5        |                                          Admin: Inserisce `username`, `password`, `ruolo`                                          |
|       6        |                                                   Sistema: Legge i dati immessi                                                    |
|       7        | Sistema: Controlla che i dati immessi non siano associati a nessun account esistente. Non esiste già un account per i dati immessi |
|       8        |                                       Sistema: Crea un nuovo user e lo memorizza nel sistema                                       |
|       9        |                                         Sistema: mostra a schermo un messaggio di successo                                         |

#### Scenario 2.2

|  Scenario 2.2  |                                                Username già in uso `(Code 409)`                                                 |
| :------------: | :-----------------------------------------------------------------------------------------------------------------------------: |
|  Precondition  |                                                         U ha un account                                                         |
| Post condition |                                                      Registrazione fallita                                                      |
|     Step#      |                                                           Descrizione                                                           |
|       1        |                                           Admin: Clicca il pulsante di registrazione                                            |
|       2        |                                Sistema: Verifica la presenza di un token valido nella richiesta                                 |
|       3        |                                              Sistema: Rileva che il token è valido                                              |
|       4        |                                         Sistema: Chiede `username`, `password`, `ruolo`                                         |
|       5        |                                        Admin: Inserisce `username`, `password`, `ruolo`                                         |
|       6        |                                                  Sistema: Legge i dati immessi                                                  |
|       7        | Sistema: Controlla che i dati immessi non siano associati a nessun account esistente. Risulta già un account per i dati immessi |
|       8        |                                        Sistema: mostra a schermo un messaggio di errore                                         |

#### Scenario 3.3

|  Scenario 3.3  |                               User inserisce parametri vuoti `(Code 400)`                               |
| :------------: | :-----------------------------------------------------------------------------------------------------: |
|  Precondition  |                                           U non ha un account                                           |
| Post condition |                                          Registrazione fallita                                          |
|     Step#      |                                               Descrizione                                               |
|       1        |                               Admin: Clicca il pulsante di registrazione                                |
|       2        |                    Sistema: Verifica la presenza di un token valido nella richiesta                     |
|       3        |                                  Sistema: Rileva che il token è valido                                  |
|       4        |                             Sistema: Chiede`username`, `password`, `ruolo`                              |
|       5        |                            Admin: Inserisce `username`, `password`, `ruolo`                             |
|       6        |                                      Sistema: Legge i dati immessi                                      |
|       7        | Sistema: Controlla che tutti i parametri richiesti siano soddisfatti. Almeno un parametro risulta vuoto |
|       8        |                            Sistema: mostra a schermo un messaggio di errore                             |

#### Scenario 3.4

|  Scenario 3.4  |             Token mancante o malformato `(Code 401)`              |
| :------------: | :---------------------------------------------------------------: |
|  Precondition  |                        U non ha un account                        |
| Post condition |                       Registrazione fallita                       |
|     Step#      |                            Descrizione                            |
|       1        |            Admin: Clicca il pulsante di registrazione             |
|       2        | Sistema: Verifica la presenza di un token valido nella richiesta  |
|       3        | Sistema: Rileva che il token è assente o in un formato non valido |
|       4        |           Sistema: Blocca il processo di registrazione            |
|       5        |               Sistema: Mostra un messaggio d'errore               |

#### Scenario 3.5

|  Scenario 3.5  |                         Diritti insufficienti `(Code 403)`                         |
| :------------: | :--------------------------------------------------------------------------------: |
|  Precondition  |                                U non ha un account                                 |
| Post condition |                               Registrazione fallita                                |
|     Step#      |                                    Descrizione                                     |
|       1        |                     Admin: Clicca il pulsante di registrazione                     |
|       2        |          Sistema: Verifica la presenza di un token valido nella richiesta          |
|       3        | Sistema: Rileva che l'utente associato al token non ha i diritti di registrazionee |
|       4        |                    Sistema: Blocca il processo di registrazione                    |
|       5        |                       Sistema: Mostra un messaggio d'errore                        |

### Use Case 4, Rimozione Account (UC4)

| Actors Involved  |                Admin                 |
| :--------------: | :----------------------------------: |
|   Precondition   |    Almeno un utente è registrato     |
|  Post condition  | L'aacount dello user viene eliminato |
| Nominal Scenario |             Scenario 4.1             |
|     Variants     |               Nessuna                |
|    Exceptions    |          4.1, 4.2, 4.3, 4.4          |

#### Scenario 4.1

|  Scenario 4.1  |                       Eliminazione Utente `(Code 204)`                        |
| :------------: | :---------------------------------------------------------------------------: |
|  Precondition  |                            Utente U ha un account                             |
| Post condition |                           Account utente eliminato                            |
|     Step#      |                                  Descrizione                                  |
|       1        |               Admin: Clicca il pulsante di eliminazione accuont               |
|       2        |       Sistema: Verifica la presenza di un token valido nella richiesta        |
|       3        |                     Sistema: Rileva che il token è valido                     |
|       4        |                          Sistema: Chiede `username`                           |
|       5        |                          Admin: Inserisce `username`                          |
|       6        |                         Sistema: Legge i dati immessi                         |
|       7        | Sistema: Controlla che i dati immessi siano associati a un account esistente. |
|       8        |                          Sistema: Elimina l'account                           |
|       9        |              Sistema: mostra a schermo un messaggio di successo               |

#### Scenario 4.2

|  Scenario 4.2  |             Token mancante o malformato `(Code 401)`              |
| :------------: | :---------------------------------------------------------------: |
|  Precondition  |                      Utente U ha un account                       |
| Post condition |                   Eliminazione Account fallita                    |
|     Step#      |                            Descrizione                            |
|       1        |             Admin: Clicca il pulsante di elimanzione              |
|       2        | Sistema: Verifica la presenza di un token valido nella richiesta  |
|       3        | Sistema: Rileva che il token è assente o in un formato non valido |
|       4        |            Sistema: Blocca il processo di elimanzione             |
|       5        |               Sistema: Mostra un messaggio d'errore               |

#### Scenario 4.3

|  Scenario 4.3  |                            Diritti insufficienti `(Code 403)`                             |
| :------------: | :---------------------------------------------------------------------------------------: |
|  Precondition  |                                  Utente U ha un account                                   |
| Post condition |                               Eliminazione Account fallita                                |
|     Step#      |                                        Descrizione                                        |
|       1        |                         Admin: Clicca il pulsante di elimanzione                          |
|       2        |             Sistema: Verifica la presenza di un token valido nella richiesta              |
|       3        | Sistema: Sistema: Rileva che l'utente associato al token non ha i diritti di eliminazione |
|       4        |                        Sistema: Blocca il processo di elimanzione                         |
|       5        |                           Sistema: Mostra un messaggio d'errore                           |

#### Scenario 4.4

|  Scenario 4.4  |                               Account utente non trovato `(Code 404)`                               |
| :------------: | :-------------------------------------------------------------------------------------------------: |
|  Precondition  |                                       Utente U ha un account                                        |
| Post condition |                                      Account utente eliminato                                       |
|     Step#      |                                             Descrizione                                             |
|       1        |                          Admin: Clicca il pulsante di eliminazione accuont                          |
|       2        |                  Sistema: Verifica la presenza di un token valido nella richiesta                   |
|       3        |                                Sistema: Rileva che il token è valido                                |
|       4        |                                     Sistema: Chiede `username`                                      |
|       5        |                                     Admin: Inserisce `username`                                     |
|       6        |                                    Sistema: Legge i dati immessi                                    |
|       7        | Sistema: Controlla che i dati immessi siano associati a un account esistente. L'account non trovato |
|       8        |                                Sistema: Mostra un messaggio d'errore                                |

### Use Case 5, Visualizzazione Account (UC5)

| Actors Involved  |                                   Admin                                   |
| :--------------: | :-----------------------------------------------------------------------: |
|   Precondition   |                L’admin è loggato e ha i permessi necessari                |
|  Post condition  | L’admin visualizza la lista completa degli account registrati nel sistema |
| Nominal Scenario |                               Scenario 5.1                                |
|     Variants     |                                    5.2                                    |
|    Exceptions    |                                 5.3, 5.4                                  |

#### Scenario 5.1

|  Scenario 5.1  |                Visualizzazione elenco account `(Code 200)`                |
| :------------: | :-----------------------------------------------------------------------: |
|  Precondition  |                L’admin è loggato e ha i permessi necessari                |
| Post condition | L’admin visualizza la lista completa degli account registrati nel sistema |
|     Step#      |                                Descrizione                                |
|       1        |              Admin: Clicca il pulsante di Visualizza Account              |
|       2        |     Sistema: Verifica la presenza di un token valido nella richiesta      |
|       3        |                   Sistema: Rileva che il token è valido                   |
|       4        |             Sistema: recupera tutti gli account dal database              |
|       6        |          Sistema: mostra a schermo l'elenco degli utenti trovati          |

#### Scenario 5.2

|  Scenario 5.2  |          Visualizzazione account specifico `(Code 200)`          |
| :------------: | :--------------------------------------------------------------: |
|  Precondition  |           L’admin è loggato e ha i permessi necessari            |
| Post condition |             L’admin visualizza l'account specificato             |
|     Step#      |                           Descrizione                            |
|       1        |         Admin: Clicca il pulsante di Visualizza Account          |
|       2        | Sistema: Verifica la presenza di un token valido nella richiesta |
|       3        |              Sistema: Rileva che il token è valido               |
|       4        |        Admin: seleziona o cerca l’account da visualizzare        |
|       4        |             Sistema: recupera l'account dal database             |
|       6        |          Sistema: mostra a schermol'account specificato          |

#### Scenario 5.3

|  Scenario 5.3  |             Token mancante o malformato `(Code 401)`              |
| :------------: | :---------------------------------------------------------------: |
|  Precondition  |          Admin clicca il pulsante di Visualizza Account           |
| Post condition |                  Visualizzazione Account fallita                  |
|     Step#      |                            Descrizione                            |
|       1        |       Admin: Clicca il pulsante di visualizzazione account        |
|       2        | Sistema: Verifica la presenza di un token valido nella richiesta  |
|       3        | Sistema: Rileva che il token è assente o in un formato non valido |
|       4        |          Sistema: Blocca il processo di visualizzazione           |
|       5        |               Sistema: Mostra un messaggio d'errore               |

#### Scenario 5.4

|  Scenario 5.4  |                            Diritti insufficienti `(Code 403)`                             |
| :------------: | :---------------------------------------------------------------------------------------: |
|  Precondition  |                      Admin clicca il pulsante di Visualizza Account                       |
| Post condition |                               Eliminazione Account fallita                                |
|     Step#      |                                        Descrizione                                        |
|       1        |                   Admin: Clicca il pulsante di visualizzazione account                    |
|       2        |             Sistema: Verifica la presenza di un token valido nella richiesta              |
|       3        | Sistema: Sistema: Rileva che l'utente associato al token non ha i diritti di eliminazione |
|       4        |                      Sistema: Blocca il processo di visualizzazione                       |
|       5        |                           Sistema: Mostra un messaggio d'errore                           |

#### Scenario 5.5

#### DA FINIRE

|  Scenario 5.5  |                              Utente non trovato `(Code 404)`                              |
| :------------: | :---------------------------------------------------------------------------------------: |
|  Precondition  |                      Admin clicca il pulsante di Visualizza Account                       |
| Post condition |                               Eliminazione Account fallita                                |
|     Step#      |                                        Descrizione                                        |
|       1        |                   Admin: Clicca il pulsante di visualizzazione account                    |
|       2        |             Sistema: Verifica la presenza di un token valido nella richiesta              |
|       3        | Sistema: Sistema: Rileva che l'utente associato al token non ha i diritti di eliminazione |
|       4        |                      Sistema: Blocca il processo di visualizzazione                       |
|       5        |                           Sistema: Mostra un messaggio d'errore                           |

### Use Case 10, View users (UC10)

| Actors Involved  |                              Admin, Operator                              |
| :--------------: | :-----------------------------------------------------------------------: |
|   Precondition   |          L'utente è autenticato con token come Admin o Operator           |
|  Post condition  |                       La rete è creata nel sistema                        |
| Nominal Scenario |                               Scenario 10.1                               |
|     Variants     |                                   None                                    |
|    Exceptions    | Scenario 10.2, Scenario 10.3, Scenario 10.4, Scenario 10.5, Scenario 10.6 |

#### Scenario 10.1

| Scenario 10.1  |                                                               Creazione rete con successo `(Code 201)`                                                                |
| :------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|  Precondition  |                                                             L'utente è autenticato come Admin o Operator                                                              |
| Post condition |                                                            La rete viene creata ed è visibile nel sistema                                                             |
|     Step#      |                                                                              Description                                                                              |
|       1        |                                                     L'utente accede alla sezione "Gestione Reti" dell’interfaccia                                                     |
|       2        |                                                                 L'utente seleziona "Crea nuova rete"                                                                  |
|       3        | L'utente inserisce `code`, `name`, `description` nel modulo (es. NET01, Alp Monitor, ...). Eventuali campi annidati Gateway o Sensor, se presenti, verranno ignorati. |
|       4        |                                                                 L'utente invia il modulo di creazione                                                                 |
|       5        |                                           Il sistema valida i dati, registra la rete e restituisce il codice `201 Created`                                            |

#### Scenario 10.2

| Scenario 10.2  |                               Dati mancanti o input non valido `(400 BadRequest)`                                |
| :------------: | :--------------------------------------------------------------------------------------------------------------: |
|  Precondition  |                          L'utente è autenticato ma il modulo è incompleto o malformato                           |
| Post condition |                                            Nessuna rete viene creata                                             |
|     Step#      |                                                   Description                                                    |
|       1        |          L’utente omette uno o più campi obbligatori (ad esempio `code`) o inserisce valori non validi           |
|       2        |                                      L'utente invia il modulo di creazione                                       |
|       3        | Il sistema valida i dati, rileva la mancanza del campo `code` e restituisce il codice di errore `400 BadRequest` |

#### Scenario 10.3

| Scenario 10.3  |                  Token assente o non valido `(401 UnauthorizedError)`                   |
| :------------: | :-------------------------------------------------------------------------------------: |
|  Precondition  |   L'utente non ha effettuato il login oppure il token è assente, scaduto o malformato   |
| Post condition |                                Nessuna rete viene creata                                |
|     Step#      |                                       Description                                       |
|       1        |               L'utente tenta di inviare una richiesta per creare una rete               |
|       2        | La richiesta è priva di header `Authorization` oppure il token ha un formato non valido |
|       3        |      Il sistema intercetta la richiesta, verifica il token e lo considera invalido      |
|       4        |           Il sistema restituisce il codice di errore `401 UnauthorizedError`            |

#### Scenario 10.4

| Scenario 10.4  |              Ruolo non autorizzato `(403 InsufficientRightsError)`               |
| :------------: | :------------------------------------------------------------------------------: |
|  Precondition  |   L'utente è autenticato correttamente con un token valido, ma ha ruolo Viewer   |
| Post condition |                            Nessuna rete viene creata                             |
|     Step#      |                                   Description                                    |
|       1        |  L'utente accede all’interfaccia come Viewer e apre il modulo “Crea nuova rete”  |
|       2        | L'utente compila i campi e invia la richiesta per la creazione di una nuova rete |
|       3        |                    Il sistema verifica che il token è valido                     |
|       4        |      Il sistema controlla il ruolo utente e rileva i permessi insufficienti      |
|       5        |    Il sistema restituisce il codice di errore `(403 InsufficientRightsError)`    |

#### Scenario 10.5

| Scenario 10.5  |                             Codice rete già esistente `(409 ConflictError)`                              |
| :------------: | :------------------------------------------------------------------------------------------------------: |
|  Precondition  |                      L'utente è autenticato, ma il codice inserito è già registrato                      |
| Post condition |                                        Nessuna rete viene creata                                         |
|     Step#      |                                               Description                                                |
|       1        |                          L'utente compila il modulo con un codice già esistente                          |
|       2        |                                  L'utente invia il modulo di creazione                                   |
|       3        | Il sistema valida i dati, rileva la duplicazione e restituisce il codice di errore `(409 ConflictError)` |

#### Scenario 10.6

| Scenario 10.6  |                Errore interno del server `(500 InternalServerError)`                |
| :------------: | :---------------------------------------------------------------------------------: |
|  Precondition  |        L’utente è autenticato, ma si verifica un errore inatteso lato server        |
| Post condition |                              Nessuna rete viene creata                              |
|     Step#      |                                     Description                                     |
|       1        |            L'utente compila il modulo correttamente e invia la richiesta            |
|       2        | Durante l'elaborazione della richiesta si verifica un errore imprevisto lato server |
|       3        |       Il sistema restituisce il codice di errore `(500 InternalServerError)`        |

### Use Case 11, Modifica Network (UC11)

| Actors Involved  |                                     Admin, Operator                                      |
| :--------------: | :--------------------------------------------------------------------------------------: |
|   Precondition   |                  L'utente è autenticato con token come Admin o Operator                  |
|  Post condition  |                           La rete viene aggiornata nel sistema                           |
| Nominal Scenario |                                      Scenario 11.1                                       |
|     Variants     |                                           None                                           |
|    Exceptions    | Scenario 11.2, Scenario 11.3, Scenario 11.4, Scenario 11.5, Scenario 11.6, Scenario 11.7 |

#### Scenario 11.1

| Scenario 11.1  |                                                 Modifica rete con successo `(204 No Content)`                                                  |
| :------------: | :--------------------------------------------------------------------------------------------------------------------------------------------: |
|  Precondition  |                                                  L'utente è autenticato come Admin o Operator                                                  |
| Post condition |                                                      La rete viene aggiornata nel sistema                                                      |
|     Step#      |                                                                  Description                                                                   |
|       1        |                                         L'utente accede alla sezione "Gestione Reti" dell’interfaccia                                          |
|       2        |                                                   L'utente seleziona una rete da modificare                                                    |
|       3        | L'utente modifica i campi `code`, `name`, `description` nel modulo.Eventuali campi annidati Gateway o Sensor vengono ignorati e non aggiornati |
|       4        |                                                L'utente invia il modulo di modifica della rete                                                 |
|       5        |                              Il sistema valida i dati, aggiorna la rete e restituisce il codice `204 No Content`                               |

#### Scenario 11.2

| Scenario 11.2  |           Dati mancanti o input non valido `(400 BadRequest)`            |
| :------------: | :----------------------------------------------------------------------: |
|  Precondition  |      L'utente è autenticato ma il modulo è incompleto o malformato       |
| Post condition |                     Nessuna modifica viene applicata                     |
|     Step#      |                               Description                                |
|       1        |               L'utente omette uno o più campi obbligatori                |
|       2        |            L'utente invia la richiesta di modifica della rete            |
|       3        | Il sistema valida i dati, rileva l’errore e restituisce `400 BadRequest` |

#### Scenario 11.3

| Scenario 11.3  |                 Token assente o non valido `(401 UnauthorizedError)`                 |
| :------------: | :----------------------------------------------------------------------------------: |
|  Precondition  | L'utente non ha effettuato il login oppure il token è assente, scaduto o malformato  |
| Post condition |                           Nessuna modifica viene applicata                           |
|     Step#      |                                     Description                                      |
|       1        | L'utente tenta di inviare una richiesta di modifica della rete senza un token valido |
|       2        |    Il sistema intercetta la richiesta, verifica il token e lo considera invalido     |
|       3        |          Il sistema restituisce il codice di errore `401 UnauthorizedError`          |

#### Scenario 11.4

| Scenario 11.4  |          Ruolo non autorizzato `(403 InsufficientRightsError)`           |
| :------------: | :----------------------------------------------------------------------: |
|  Precondition  |       L'utente è autenticato con token valido, ma ha ruolo Viewer        |
| Post condition |                     Nessuna modifica viene applicata                     |
|     Step#      |                               Description                                |
|       1        |              L'utente Viewer apre la sezione modifica rete               |
|       2        |       L'utente compila e invia la richiesta di modifica della rete       |
|       3        | Il sistema verifica il token e il ruolo, rileva i permessi insufficienti |
|       4        | Il sistema restituisce il codice di errore `403 InsufficientRightsError` |

#### Scenario 11.5

| Scenario 11.5  |                Rete non trovata `(404 NotFoundError)`                 |
| :------------: | :-------------------------------------------------------------------: |
|  Precondition  |      L’utente inserisce un codice rete non esistente nel sistema      |
| Post condition |                   Nessuna modifica viene applicata                    |
|     Step#      |                              Description                              |
|       1        |         L'utente seleziona o inserisce un codice rete errato          |
|       2        | Il sistema non trova la rete e restituisce errore `404 NotFoundError` |

#### Scenario 11.6

| Scenario 11.6  |             Codice rete già esistente `(409 ConflictError)`              |
| :------------: | :----------------------------------------------------------------------: |
|  Precondition  |       L’utente modifica il codice della rete con uno già esistente       |
| Post condition |                     Nessuna modifica viene applicata                     |
|     Step#      |                               Description                                |
|       1        | L'utente inserisce un nuovo `code` che identifica una rete già esistente |
|       2        | Il sistema rileva il conflitto e restituisce errore `409 ConflictError`  |

#### Scenario 11.7

| Scenario 11.7  |                Errore interno del server `(500 InternalServerError)`                 |
| :------------: | :----------------------------------------------------------------------------------: |
|  Precondition  |        L’utente è autenticato, ma si verifica un errore inatteso lato server         |
| Post condition |                           Nessuna modifica viene applicata                           |
|     Step#      |                                     Description                                      |
|       1        | L'utente compila correttamente il modulo e invia la richiesta di modifica della rete |
|       2        | Durante l'elaborazione della richiesta si verifica un errore imprevisto lato server  |
|       3        |        Il sistema restituisce il codice di errore `(500 InternalServerError)`        |

### Use Case 12, Eliminazione Network (UC12)

| Actors Involved  |                      Admin, Operator                       |
| :--------------: | :--------------------------------------------------------: |
|   Precondition   |   L'utente è autenticato con token come Admin o Operator   |
|  Post condition  |            La rete viene eliminata dal sistema             |
| Nominal Scenario |                       Scenario 12.1                        |
|     Variants     |                            None                            |
|    Exceptions    | Scenario 12.2, Scenario 12.3, Scenario 12.4, Scenario 12.5 |

#### Scenario 12.1

| Scenario 12.1  |                       Eliminazione rete con successo `(204 No Content)`                        |
| :------------: | :--------------------------------------------------------------------------------------------: |
|  Precondition  |                          L'utente è autenticato come Admin o Operator                          |
| Post condition |                              La rete viene eliminata dal sistema                               |
|     Step#      |                                          Description                                           |
|       1        |                 L'utente accede alla sezione "Gestione Reti" dell’interfaccia                  |
|       2        |                    L'utente seleziona una rete esistente e preme "Elimina"                     |
|       3        | Il sistema riceve la richiesta, verifica il parametro `networkCode` e procede all'eliminazione |
|       4        |                       Il sistema restituisce il codice `204 No Content`                        |

#### Scenario 12.2

| Scenario 12.2  |                Token assente o non valido `(401 UnauthorizedError)`                 |
| :------------: | :---------------------------------------------------------------------------------: |
|  Precondition  | L'utente non ha effettuato il login oppure il token è assente, scaduto o malformato |
| Post condition |                            Nessuna rete viene eliminata                             |
|     Step#      |                                     Description                                     |
|       1        | L'utente invia la richiesta di eliminazione senza un header `Authorization` valido  |
|       2        |                Il sistema verifica il token e lo considera invalido                 |
|       3        |              Il sistema restituisce il codice `401 UnauthorizedError`               |

#### Scenario 12.3

| Scenario 12.3  |          Ruolo non autorizzato `(403 InsufficientRightsError)`           |
| :------------: | :----------------------------------------------------------------------: |
|  Precondition  |       L'utente è autenticato con token valido, ma ha ruolo Viewer        |
| Post condition |                       Nessuna rete viene eliminata                       |
|     Step#      |                               Description                                |
|       1        |               L'utente Viewer tenta di eliminare una rete                |
|       2        |   Il sistema verifica il ruolo utente e rileva permessi insufficienti    |
|       3        | Il sistema restituisce il codice di errore `403 InsufficientRightsError` |

#### Scenario 12.4

| Scenario 12.4  |                     Rete non trovata `(404 NotFoundError)`                     |
| :------------: | :----------------------------------------------------------------------------: |
|  Precondition  |               L’utente specifica un `networkCode` non esistente                |
| Post condition |                          Nessuna rete viene eliminata                          |
|     Step#      |                                  Description                                   |
|       1        | L'utente invia la richiesta DELETE con un codice rete non presente nel sistema |
|       2        |     Il sistema non trova la rete e restituisce errore `404 NotFoundError`      |

#### Scenario 12.5

| Scenario 12.5  |                Errore interno del server `(500 InternalServerError)`                |
| :------------: | :---------------------------------------------------------------------------------: |
|  Precondition  |        L’utente è autenticato, ma si verifica un errore inatteso lato server        |
| Post condition |                            Nessuna rete viene eliminata                             |
|     Step#      |                                     Description                                     |
|       1        |                 L'utente invia una richiesta valida di eliminazione                 |
|       2        | Durante l'elaborazione della richiesta si verifica un errore imprevisto lato server |
|       3        |        Il sistema restituisce il codice di errore `500 InternalServerError`         |

### Use Case 13, Recupero lista Network (UC13)

| Actors Involved  |             Admin, Operator, Viewer             |
| :--------------: | :---------------------------------------------: |
|   Precondition   |     L'utente è autenticato con token valido     |
|  Post condition  | L'elenco delle reti viene restituito all’utente |
| Nominal Scenario |                  Scenario 13.1                  |
|     Variants     |                      None                       |
|    Exceptions    |          Scenario 13.2, Scenario 13.3           |

#### Scenario 13.1

| Scenario 13.1  |                 Recupero lista reti con successo `(200 OK)`                 |
| :------------: | :-------------------------------------------------------------------------: |
|  Precondition  |                   L'utente è autenticato con token valido                   |
| Post condition |    Il sistema restituisce una lista (anche eventualmente vuota) di reti     |
|     Step#      |                                 Description                                 |
|       1        | L'utente accede alla sezione "Reti" o invia una richiesta GET a `/networks` |
|       2        |                         Il sistema valida il token                          |
|       3        |       Il sistema restituisce la lista delle reti con codice `200 OK`        |

#### Scenario 13.2

| Scenario 13.2  |      Token assente o non valido `(401 UnauthorizedError)`       |
| :------------: | :-------------------------------------------------------------: |
|  Precondition  |  L'utente non ha effettuato il login o ha un token non valido   |
| Post condition |                 Nessuna lista viene restituita                  |
|     Step#      |                           Description                           |
|       1        | L'utente invia la richiesta senza header `Authorization` valido |
|       2        | Il sistema rileva che il token è assente, scaduto o malformato  |
|       3        |      Il sistema restituisce errore `401 UnauthorizedError`      |

#### Scenario 13.3

| Scenario 13.3  |        Errore interno del server `(500 InternalServerError)`         |
| :------------: | :------------------------------------------------------------------: |
|  Precondition  |     L'utente è autenticato, ma si verifica un errore imprevisto      |
| Post condition |                    Nessuna lista viene restituita                    |
|     Step#      |                             Description                              |
|       1        |     L'utente invia una richiesta valida per la lista delle reti      |
|       2        |    Il sistema riscontra un errore interno durante l'elaborazione     |
|       3        | Il sistema restituisce il codice di errore `500 InternalServerError` |

### Use Case 14, Recupero singolo Network (UC14)

| Actors Involved  |               Admin, Operator, Viewer               |
| :--------------: | :-------------------------------------------------: |
|   Precondition   |       L'utente è autenticato con token valido       |
|  Post condition  | I dettagli della rete vengono restituiti all’utente |
| Nominal Scenario |                    Scenario 14.1                    |
|     Variants     |                        None                         |
|    Exceptions    |     Scenario 14.2, Scenario 14.3, Scenario 14.4     |

#### Scenario 14.1

| Scenario 14.1  |            Recupero rete con successo `(200 OK)`             |
| :------------: | :----------------------------------------------------------: |
|  Precondition  |           L'utente è autenticato con token valido            |
| Post condition |         Il sistema restituisce i dettagli della rete         |
|     Step#      |                         Description                          |
|       1        | L'utente invia una richiesta GET a `/networks/{networkCode}` |
|       2        |         Il sistema riceve e interpreta la richiesta          |
|       3        |                  Il sistema valida il token                  |
|       4        | Il sistema restituisce i dati della rete con codice `200 OK` |

#### Scenario 14.2

| Scenario 14.2  |      Token assente o non valido `(401 UnauthorizedError)`       |
| :------------: | :-------------------------------------------------------------: |
|  Precondition  |  L'utente non ha effettuato il login o ha un token non valido   |
| Post condition |                  Nessuna rete viene restituita                  |
|     Step#      |                           Description                           |
|       1        | L'utente invia la richiesta senza header `Authorization` valido |
|       2        | Il sistema rileva che il token è assente, scaduto o malformato  |
|       3        |      Il sistema restituisce errore `401 UnauthorizedError`      |

#### Scenario 14.3

| Scenario 14.3  |               Rete non trovata `(404 NotFoundError)`                |
| :------------: | :-----------------------------------------------------------------: |
|  Precondition  |     Il `networkCode` specificato non corrisponde ad alcuna rete     |
| Post condition |                    Nessuna rete viene restituita                    |
|     Step#      |                             Description                             |
|       1        | L'utente invia una richiesta GET con un `networkCode` non esistente |
|       2        |          Il sistema non trova alcuna rete con quel codice           |
|       3        |          Il sistema restituisce errore `404 NotFoundError`          |

#### Scenario 14.4

| Scenario 14.4  |     Errore interno del server `(500 InternalServerError)`      |
| :------------: | :------------------------------------------------------------: |
|  Precondition  |  L’utente è autenticato, ma si verifica un errore lato server  |
| Post condition |                 Nessuna rete viene restituita                  |
|     Step#      |                          Description                           |
|       1        | L'utente invia una richiesta valida per il recupero della rete |
|       2        |        Il sistema riscontra un errore interno inatteso         |
|       3        |    Il sistema restituisce errore `500 InternalServerError`     |

### Use Case 23, Conversione timestamp da orario locale a UTC (FR3.1.1)

| Actors Involved  |       Admin, Operator, Viewer       |
| :--------------: | :---------------------------------: |
|   Precondition   | Il timestamp è nel formato ISO 8601 |
|  Post condition  |    Il timestamp viene convertito    |
| Nominal Scenario |            Scenario 24.1            |
|     Variants     |                                     |
|    Exceptions    |                                     |

#### Scenario 23.1

| Scenario 23.1  |                          Conversione timestamp da orario locale a UTC                           |
| :------------: | :---------------------------------------------------------------------------------------------: |
|  Precondition  |                               Il timestamp è nel formato ISO 8601                               |
| Post condition |                                  Il timestamp viene convertito                                  |
|     Step#      |                                           Descrizione                                           |
|       1        | Sistema: converte timestamp da fuso orario locale (specificato nel timestamp) a fuso orario UTC |
|       2        |                                Sistema: Restituisce il timestamp                                |

### Use Case 24, Conversione timestamp da UTC a orario locale (FR3.1.2)

| Actors Involved  |       Admin, Operator, Viewer       |
| :--------------: | :---------------------------------: |
|   Precondition   | Il timestamp è nel formato ISO 8601 |
|  Post condition  |    Il timestamp viene convertito    |
| Nominal Scenario |            Scenario 24.1            |
|     Variants     |                                     |
|    Exceptions    |                                     |

#### Scenario 24.1

| Scenario 24.1  |            Conversione timestamp da UTC a orario locale             |
| :------------: | :-----------------------------------------------------------------: |
|  Precondition  | Il timestamp è nel formato ISO 8601 e il fuso orario locale è noto  |
| Post condition |                    Il timestamp viene convertito                    |
|     Step#      |                             Descrizione                             |
|       1        | Sistema: converte timestamp da fuso orario UTC a fuso orario locale |
|       2        |                  Sistema: Restituisce il timestamp                  |

### Use Case 25, Visualizzazione misurazioni (FR3.2)

| Actors Involved  |      Admin, Operator, Viewer      |
| :--------------: | :-------------------------------: |
|   Precondition   | Il network deve essere registrato |
|  Post condition  |  Le misurazioni vengono mostrate  |
| Nominal Scenario |           Scenario 25.1           |
|     Variants     |           Scenario 25.2           |
|    Exceptions    |                                   |

#### Scenario 25.1

| Scenario 25.1  |                Visualizzazione misurazioni di un network `(Code 200)`                 |
| :------------: | :-----------------------------------------------------------------------------------: |
|  Precondition  |                           Il network deve essere registrato                           |
| Post condition |                            Le misurazioni vengono mostrate                            |
|     Step#      |                                      Descrizione                                      |
|       1        |           Utente: Accede alla sezione di visualizzazione delle misurazioni            |
|       2        |                             Utente: Seleziona un network                              |
|       3        |                          INCLUDE Calcolo statistiche (UC...)                          |
|       4        |        Sistema: Recupera le misurazioni dei sensori appartenenenti al network         |
|       5        | Sistema: Restituisce le misurazioni e statistiche dei sensori appartenenti al network |

#### Scenario 25.2

| Scenario 25.2  |                                 Visualizzazione filtrata misurazioni di un network `(Code 200)`                                 |
| :------------: | :-----------------------------------------------------------------------------------------------------------------------------: |
|  Precondition  |                                                Il network deve essere registrato                                                |
| Post condition |                                                 Le misurazioni vengono mostrate                                                 |
|     Step#      |                                                           Descrizione                                                           |
|       1        |                                Utente: Accede alla sezione di visualizzazione delle misurazioni                                 |
|       2        |                       Utente: Seleziona un network e i filtri di interesse (sensori, intervallo di tempo)                       |
|       3        |             Sistema: Se la data non ha fuso orario UTC effettua conversione timestamp da orario locale a UTC (UC23)             |
|       4        |                                               INCLUDE Calcolo statistiche (UC...)                                               |
|       5        |                             Sistema: Recupera le misurazioni dei sensori appartenenenti al network                              |
|       6        | Sistema: Se la data specificata dall'utente non ha fuso orario UTC effettua conversione timestamp da UTC a orario locale (UC24) |
|       7        |         Sistema: Restituisce le misurazioni e statistiche dei sensori appartenenti al network secondo i filtri indicati         |

### Use Case 26, Inserimento misurazioni (FR3.3)

| Actors Involved  |            Admin, Operator            |
| :--------------: | :-----------------------------------: |
|   Precondition   |        Il sensore è registrato        |
|  Post condition  |         Misurazione inserita          |
| Nominal Scenario |             Scenario 26.1             |
|     Variants     |                Nessuna                |
|    Exceptions    | Scenario 26.2, 26.3, 26.4, 26.5, 26.6 |

#### Scenario 26.1

| Scenario 26.1  |                                                            Misurazione creata `(Code 201)`                                                             |
| :------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------: |
|  Precondition  |                                                                Il sensore è registrato                                                                 |
| Post condition |                                                                  Misurazione inserita                                                                  |
|     Step#      |                                                                      Descrizione                                                                       |
|       1        |                                              Utente: Accede alla sezione di inserimento della misurazione                                              |
|       2        |                                            Sistema: Verifica la presenza di un token valido nella richiesta                                            |
|       3        |                                                         Sistema: Rileva che il token è valido                                                          |
|       4        | Utente: Inserisce `codice network`, `mac gateway`, `mac sensore`, `valore misurazione`, `timestamp misurazione` (da tastiera o tramite menù a tendina) |
|       5        |                         Sistema: Controlla che i dati immessi corrispondano a network, gateway e sensori esistenti e associati                         |
|       6        |              Sistema: Controlla che il valore della misurazione rientri tra i valori del dominio e che il timestamp abbia formato valido               |
|       7        |                      Sistema: Se il timestamp non ha fuso orario UTC effettua conversione timestamp da orario locale a UTC (UC23)                      |
|       7        |                                                           Sistema: Memorizza la misurazione                                                            |
|       8        |                                                   Sistema: mostra a schermo un messaggio di successo                                                   |

| Scenario 26.2  |                                                          Dati di input invalidi `(Code 400)`                                                           |
| :------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------: |
|  Precondition  |                                                                Il sensore è registrato                                                                 |
| Post condition |                                                         Inserimento della misurazione fallita                                                          |
|     Step#      |                                                                      Descrizione                                                                       |
|       1        |                                              Utente: Clicca il pulsante di inserimento della misurazione                                               |
|       2        |                                            Sistema: Verifica la presenza di un token valido nella richiesta                                            |
|       3        |                                                         Sistema: Rileva che il token è valido                                                          |
|       4        | Utente: Inserisce `codice network`, `mac gateway`, `mac sensore`, `valore misurazione`, `timestamp misurazione` (da tastiera o tramite menù a tendina) |
|       5        |                                                             Sistema: Legge i dati immessi                                                              |
|       6        |              Sistema: Controlla che il valore della misurazione rientri tra i valori del dominio e che il timestamp abbia formato valido               |
|       7        |                                                    Sistema: mostra a schermo un messaggio di errore                                                    |

| Scenario 26.3  |                   Non autorizzato `(Code 401)`                   |
| :------------: | :--------------------------------------------------------------: |
|  Precondition  |                     Il sensore è registrato                      |
| Post condition |              Inserimento della misurazione fallita               |
|     Step#      |                           Descrizione                            |
|       1        |   Utente: Clicca il pulsante di inserimento della misurazione    |
|       2        | Sistema: Verifica la presenza di un token valido nella richiesta |
|       3        |            Sistema: Rileva che il token non è valido             |
|       9        |         Sistema: mostra a schermo un messaggio di errore         |

### Use Case A, Visualizzazione Statistiche (UCA)

| Actors Involved  |                            User                            |
| :--------------: | :--------------------------------------------------------: |
|   Precondition   |            L'utente è autenticato correttamente            |
|  Post condition  | L'utente visualizza le statistiche di un network richieste |
| Nominal Scenario |                        Scenario A.1                        |
|     Variants     |                        Scenario A.4                        |
|    Exceptions    |                Scenario A.2, A.3, A.5, A.6                 |

#### Scenario A.1

|  Scenario A.1  |                          Visualizzazione statistiche per un dato Network `(Code 200)`                           |
| :------------: | :-------------------------------------------------------------------------------------------------------------: |
|  Precondition  |                                             L'utente è autenticato.                                             |
| Post condition |                                  L'utente visualizza le statistiche richieste                                   |
|     Step#      |                                                   Descrizione                                                   |
|       1        |    Sistema: Chiede il codice del network `networkCode` e l'intervallo temporale [ `startDate`, `endDate` ].     |
|       2        |                              User: Inserisce `networkCode`,`startDate`, `endDate`.                              |
|       3        |            Sistema: Verifica la presenza di un token valido nella richiesta. Il token risulta valido            |
|       4        |                                         Sistema: Legge i dati forniti.                                          |
|       5        |             Sistema: Ricerca il network avente il codice fornito. Il codice network risulta valido.             |
|       6        |                       Sistema: Converte `startDate` e `endDate` da localTimezone a UTC+0                        |
|       7        | Sistema: Recupera le misurazioni del network con codice `networkCode` ed effettuate tra `startDate` e `endDate` |
|       8        |                               Sistema: calcola media e varianza delle misurazioni                               |
|       9        |                           Sistema: calcola la soglia superiore e la soglia inferiore                            |
|       10       |                                    Sistema: invia le statistiche all'utente                                     |
|       11       |                                     Utente: legge le statistiche richieste                                      |

#### Scenario A.2

|  Scenario A.2  |                                 Token mancante o malformato `(Code 401)`                                 |
| :------------: | :------------------------------------------------------------------------------------------------------: |
|  Precondition  |                                         L'utente è autenticato.                                          |
| Post condition |                               Visualizzazione statistiche non autorizzata                                |
|     Step#      |                                               Descrizione                                                |
|       1        | Sistema: Chiede il codice del network `networkCode` e l'intervallo temporale [ `startDate`, `endDate` ]. |
|       2        |                          User: Inserisce `networkCode`,`startDate`, `endDate`.                           |
|       3        |                    Sistema: Verifica la presenza di un token valido nella richiesta.                     |
|       4        |                            Sistema: Non trova un token valido corrispondente                             |
|       5        |                           Sistema: Blocca la visualizzazione delle statistiche                           |

#### Scenario A.3

|  Scenario A.3  |                                     Network non trovato `(Code 404)`                                     |
| :------------: | :------------------------------------------------------------------------------------------------------: |
|  Precondition  |                                         L'utente è autenticato.                                          |
| Post condition |                        Network di interesse non trovato, nessuna visualizzazione                         |
|     Step#      |                                               Descrizione                                                |
|       1        | Sistema: Chiede il codice del network `networkCode` e l'intervallo temporale [ `startDate`, `endDate` ]. |
|       2        |                          User: Inserisce `networkCode`,`startDate`, `endDate`.                           |
|       3        |        Sistema: Verifica la presenza di un token valido nella richiesta. Il token risulta valido         |
|       4        |                                      Sistema: Legge i dati forniti.                                      |
|       5        |                          Sistema: Ricerca il network avente il codice fornito.                           |
|       6        |                         Sistema: Non trova nessun network con il codice fornito                          |
|       7        |                            Sistema: Avvisa l'utente che il network non esiste                            |

#### Scenario A.4

|  Scenario A.4  |                                         Visualizzazione statistiche per un Sensore specifico `(Code 200)`                                         |
| :------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------: |
|  Precondition  |                                                              L'utente è autenticato.                                                              |
| Post condition |                                                   L'utente visualizza le statistiche richieste                                                    |
|     Step#      |                                                                    Descrizione                                                                    |
|       1        | Sistema: Chiede il codice del network `networkCode`, l'indirizzo MAC del sensore `sensorMAC` e l'intervallo temporale [ `startDate`, `endDate` ]. |
|       2        |                                        User: Inserisce `networkCode`,`networkCode`,`startDate`, `endDate`.                                        |
|       3        |                             Sistema: Verifica la presenza di un token valido nella richiesta. Il token risulta valido                             |
|       4        |                                                          Sistema: Legge i dati forniti.                                                           |
|       5        |                              Sistema: Ricerca il network avente il codice fornito. Il codice network risulta valido.                              |
|       6        |                       Sistema: Ricerca il sensore avente il MAC fornito all'interno del network. Il sensore viene trovato.                        |
|       7        |                                        Sistema: Converte `startDate` e `endDate` da localTimezone a UTC+0                                         |
|       8        |                  Sistema: Recupera le misurazioni del network con codice `networkCode` ed effettuate tra `startDate` e `endDate`                  |
|       9        |                                                Sistema: calcola media e varianza delle misurazioni                                                |
|       10       |                                            Sistema: calcola la soglia superiore e la soglia inferiore                                             |
|       11       |                                                     Sistema: invia le statistiche all'utente                                                      |
|       12       |                                                      Utente: legge le statistiche richieste                                                       |

#### Scenario A.5

|  Scenario A.5  |                               Visualizzazione statistiche per un Sensore, Token mancante o malformato `(Code 401)`                                |
| :------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------: |
|  Precondition  |                                                              L'utente è autenticato.                                                              |
| Post condition |                                                   L'utente visualizza le statistiche richieste                                                    |
|     Step#      |                                                                    Descrizione                                                                    |
|       1        | Sistema: Chiede il codice del network `networkCode`, l'indirizzo MAC del sensore `sensorMAC` e l'intervallo temporale [ `startDate`, `endDate` ]. |
|       2        |                                        User: Inserisce `networkCode`,`networkCode`,`startDate`, `endDate`.                                        |
|       3        |                                         Sistema: Verifica la presenza di un token valido nella richiesta.                                         |
|       4        |                                                 Sistema: Non trova un token valido corrispondente                                                 |
|       5        |                                               Sistema: Blocca la visualizzazione delle statistiche                                                |

#### Scenario A.6

|  Scenario A.6  |                            Visualizzazione statistiche per un Sensore, Network/Gateway/Sensor non trovato `(Code 404)`                            |
| :------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------: |
|  Precondition  |                                                              L'utente è autenticato.                                                              |
| Post condition |                                        Network o sensore di interesse non trovato, nessuna visualizzazione                                        |
|     Step#      |                                                                    Descrizione                                                                    |
|       1        | Sistema: Chiede il codice del network `networkCode`, l'indirizzo MAC del sensore `sensorMAC` e l'intervallo temporale [ `startDate`, `endDate` ]. |
|       2        |                                        User: Inserisce `networkCode`,`networkCode`,`startDate`, `endDate`.                                        |
|       3        |                             Sistema: Verifica la presenza di un token valido nella richiesta. Il token risulta valido                             |
|       4        |                                                          Sistema: Legge i dati forniti.                                                           |
|       5        |                                             Sistema: Ricerca del network e del sensore corrispondenti                                             |
|       6        |                                                    Sistema: Non trova il network o il sensore                                                     |
|       7        |                                      Sistema: Avvisa l'utente che la combinazione network/sensore non esiste                                      |

### Use Case B, Visualizzazione Outliers (UCB)

| Actors Involved  |                           User                            |
| :--------------: | :-------------------------------------------------------: |
|   Precondition   |           L'utente è autenticato correttamente            |
|  Post condition  | L'utente visualizza le misurazioni outliers di un network |
| Nominal Scenario |                       Scenario B.1                        |
|     Variants     |                       Scenario B.4                        |
|    Exceptions    |                Scenario B.2, B.3, B.5, B.6                |

#### Scenario B.1

|  Scenario B.1  |                         Visualizzazione outliers per un Network specifico `(Code 200)`                          |
| :------------: | :-------------------------------------------------------------------------------------------------------------: |
|  Precondition  |                                             L'utente è autenticato.                                             |
| Post condition |                                        L'utente visualizza gli outliers                                         |
|     Step#      |                                                   Descrizione                                                   |
|       1        |    Sistema: Chiede il codice del network `networkCode` e l'intervallo temporale [ `startDate`, `endDate` ].     |
|       2        |                              User: Inserisce `networkCode`,`startDate`, `endDate`.                              |
|       3        |            Sistema: Verifica la presenza di un token valido nella richiesta. Il token risulta valido            |
|       4        |                                         Sistema: Legge i dati forniti.                                          |
|       5        |             Sistema: Ricerca il network avente il codice fornito. Il codice network risulta valido.             |
|       6        |                       Sistema: Converte `startDate` e `endDate` da localTimezone a UTC+0                        |
|       7        | Sistema: Recupera le misurazioni del network con codice `networkCode` ed effettuate tra `startDate` e `endDate` |
|       8        |                               Sistema: calcola media e varianza delle misurazioni                               |
|       9        |                           Sistema: calcola la soglia superiore e la soglia inferiore                            |
|       10       |                       Sistema: per ogni misurazione confronta il suo valore con le soglie                       |
|       11       |  Sistema: la misurazione viene settata come outlier se è al di fuori dall'intervallo definito dalle due soglie  |
|       12       |                      Sistema: converte la data della misurazione da UTF-0 a localTimezone                       |
|       13       |                             Sistema: invia le statistiche e gli outliers all'utente                             |
|       14       |                                   Utente: legge le statistiche e gli outliers                                   |

#### Scenario B.2

|  Scenario B.2  |                                 Token mancante o malformato `(Code 401)`                                 |
| :------------: | :------------------------------------------------------------------------------------------------------: |
|  Precondition  |                                         L'utente è autenticato.                                          |
| Post condition |                                 Visualizzazione outliers non autorizzata                                 |
|     Step#      |                                               Descrizione                                                |
|       1        | Sistema: Chiede il codice del network `networkCode` e l'intervallo temporale [ `startDate`, `endDate` ]. |
|       2        |                          User: Inserisce `networkCode`,`startDate`, `endDate`.                           |
|       3        |                    Sistema: Verifica la presenza di un token valido nella richiesta.                     |
|       4        |                            Sistema: Non trova un token valido corrispondente                             |
|       5        |                            Sistema: Blocca la visualizzazione degli outliers                             |

#### Scenario B.3

|  Scenario B.3  |                                     Network non trovato `(Code 404)`                                     |
| :------------: | :------------------------------------------------------------------------------------------------------: |
|  Precondition  |                                         L'utente è autenticato.                                          |
| Post condition |                        Network di interesse non trovato, nessuna visualizzazione                         |
|     Step#      |                                               Descrizione                                                |
|       1        | Sistema: Chiede il codice del network `networkCode` e l'intervallo temporale [ `startDate`, `endDate` ]. |
|       2        |                          User: Inserisce `networkCode`,`startDate`, `endDate`.                           |
|       3        |        Sistema: Verifica la presenza di un token valido nella richiesta. Il token risulta valido         |
|       4        |                                      Sistema: Legge i dati forniti.                                      |
|       5        |                          Sistema: Ricerca il network avente il codice fornito.                           |
|       6        |                         Sistema: Non trova nessun network con il codice fornito                          |
|       7        |                            Sistema: Avvisa l'utente che il network non esiste                            |

#### Scenario B.4

|  Scenario B.4  |                                          Visualizzazione outliers per un Sensore specifico `(Code 200)`                                           |
| :------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------: |
|  Precondition  |                                                              L'utente è autenticato.                                                              |
| Post condition |                                                         L'utente visualizza gli outliers                                                          |
|     Step#      |                                                                    Descrizione                                                                    |
|       1        | Sistema: Chiede il codice del network `networkCode`, l'indirizzo MAC del sensore `sensorMAC` e l'intervallo temporale [ `startDate`, `endDate` ]. |
|       2        |                                        User: Inserisce `networkCode`,`networkCode`,`startDate`, `endDate`.                                        |
|       3        |                             Sistema: Verifica la presenza di un token valido nella richiesta. Il token risulta valido                             |
|       4        |                                                          Sistema: Legge i dati forniti.                                                           |
|       5        |                              Sistema: Ricerca il network avente il codice fornito. Il codice network risulta valido.                              |
|       6        |                       Sistema: Ricerca il sensore avente il MAC fornito all'interno del network. Il sensore viene trovato.                        |
|       7        |                                        Sistema: Converte `startDate` e `endDate` da localTimezone a UTC+0                                         |
|       8        |                  Sistema: Recupera le misurazioni del network con codice `networkCode` ed effettuate tra `startDate` e `endDate`                  |
|       9        |                                                Sistema: calcola media e varianza delle misurazioni                                                |
|       10       |                                            Sistema: calcola la soglia superiore e la soglia inferiore                                             |
|       11       |                                        Sistema: per ogni misurazione confronta il suo valore con le soglie                                        |
|       12       |                   Sistema: la misurazione viene settata come outlier se è al di fuori dall'intervallo definito dalle due soglie                   |
|       13       |                                       Sistema: converte la data della misurazione da UTF-0 a localTimezone                                        |
|       14       |                                              Sistema: invia le statistiche e gli outliers all'utente                                              |
|       15       |                                                    Utente: legge le statistiche e gli outliers                                                    |

#### Scenario B.5

|  Scenario B.5  |                                                     Token mancante o malformato `(Code 401)`                                                      |
| :------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------: |
|  Precondition  |                                                              L'utente è autenticato.                                                              |
| Post condition |                                                     Visualizzazione outliers non autorizzata                                                      |
|     Step#      |                                                                    Descrizione                                                                    |
|       1        | Sistema: Chiede il codice del network `networkCode`, l'indirizzo MAC del sensore `sensorMAC` e l'intervallo temporale [ `startDate`, `endDate` ]. |
|       2        |                                        User: Inserisce `networkCode`,`networkCode`,`startDate`, `endDate`.                                        |
|       3        |                                         Sistema: Verifica la presenza di un token valido nella richiesta.                                         |
|       4        |                                                 Sistema: Non trova un token valido corrispondente                                                 |
|       5        |                                                 Sistema: Blocca la visualizzazione degli outliers                                                 |

#### Scenario B.6

|  Scenario B.6  |                                                         Network non trovato `(Code 404)`                                                          |
| :------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------: |
|  Precondition  |                                                              L'utente è autenticato.                                                              |
| Post condition |                                             Network di interesse non trovato, nessuna visualizzazione                                             |
|     Step#      |                                                                    Descrizione                                                                    |
|       1        | Sistema: Chiede il codice del network `networkCode`, l'indirizzo MAC del sensore `sensorMAC` e l'intervallo temporale [ `startDate`, `endDate` ]. |
|       2        |                                        User: Inserisce `networkCode`,`networkCode`,`startDate`, `endDate`.                                        |
|       3        |                             Sistema: Verifica la presenza di un token valido nella richiesta. Il token risulta valido                             |
|       4        |                                                          Sistema: Legge i dati forniti.                                                           |
|       5        |                                             Sistema: Ricerca del network e del sensore corrispondenti                                             |
|       6        |                                                    Sistema: Non trova il network o il sensore                                                     |
|       7        |                                      Sistema: Avvisa l'utente che la combinazione network/sensore non esiste                                      |

### Use Case C, Calcolo della media (UCC)

| Actors Involved  |                  User                   |
| :--------------: | :-------------------------------------: |
|   Precondition   |  L'utente è autenticato correttamente   |
|  Post condition  | L'utente ottiene il calcolo della media |
| Nominal Scenario |              Scenario C.1               |
|     Variants     |              Scenario C.5               |
|    Exceptions    |         Scenario C.2, C.3, C.4          |

#### Scenario C.1

|  Scenario C.1  |                              Visualizzazione media misurazioni per un dato Network                              |
| :------------: | :-------------------------------------------------------------------------------------------------------------: |
|  Precondition  |                                             L'utente è autenticato.                                             |
| Post condition |                                  L'utente visualizza le statistiche richieste                                   |
|     Step#      |                                                   Descrizione                                                   |
|       1        |    Sistema: Chiede il codice del network `networkCode` e l'intervallo temporale [ `startDate`, `endDate` ].     |
|       2        |                              User: Inserisce `networkCode`,`startDate`, `endDate`.                              |
|       3        |            Sistema: Verifica la presenza di un token valido nella richiesta. Il token risulta valido            |
|       4        |                                         Sistema: Legge i dati forniti.                                          |
|       5        |             Sistema: Ricerca il network avente il codice fornito. Il codice network risulta valido.             |
|       6        |                       Sistema: Converte `startDate` e `endDate` da localTimezone a UTC+0                        |
|       7        | Sistema: Recupera le misurazioni del network con codice `networkCode` ed effettuate tra `startDate` e `endDate` |
|       8        |         Sistema: Verifica che ci sia almeno una misurazione. Il sistema recupera almeno una misurazione         |
|       9        |                                            Sistema: calcola la media                                            |
|       10       |                                       Sistema: invia la media all'utente                                        |
|       11       |                                             Utente: legge la media                                              |

#### Scenario C.2

|  Scenario C.2  |                                       Token mancante o malformato                                        |
| :------------: | :------------------------------------------------------------------------------------------------------: |
|  Precondition  |                                         L'utente è autenticato.                                          |
| Post condition |                                  Visualizzazione media non autorizzata                                   |
|     Step#      |                                               Descrizione                                                |
|       1        | Sistema: Chiede il codice del network `networkCode` e l'intervallo temporale [ `startDate`, `endDate` ]. |
|       2        |                          User: Inserisce `networkCode`,`startDate`, `endDate`.                           |
|       3        |                    Sistema: Verifica la presenza di un token valido nella richiesta.                     |
|       4        |                            Sistema: Non trova un token valido corrispondente                             |
|       5        |                           Sistema: Blocca la visualizzazione delle statistiche                           |

#### Scenario C.3

|  Scenario C.3  |                                           Network non trovato                                            |
| :------------: | :------------------------------------------------------------------------------------------------------: |
|  Precondition  |                                         L'utente è autenticato.                                          |
| Post condition |                        Network di interesse non trovato, nessuna visualizzazione                         |
|     Step#      |                                               Descrizione                                                |
|       1        | Sistema: Chiede il codice del network `networkCode` e l'intervallo temporale [ `startDate`, `endDate` ]. |
|       2        |                          User: Inserisce `networkCode`,`startDate`, `endDate`.                           |
|       3        |        Sistema: Verifica la presenza di un token valido nella richiesta. Il token risulta valido         |
|       4        |                                      Sistema: Legge i dati forniti.                                      |
|       5        |                          Sistema: Ricerca il network avente il codice fornito.                           |
|       6        |                         Sistema: Non trova nessun network con il codice fornito                          |
|       7        |                            Sistema: Avvisa l'utente che il network non esiste                            |

#### Scenario C.4 ??

|  Scenario C.4  |                                           Nessuna misurazione trovata                                           |
| :------------: | :-------------------------------------------------------------------------------------------------------------: |
|  Precondition  |                                             L'utente è autenticato.                                             |
| Post condition |                                          Nessuna media da visualizzare                                          |
|     Step#      |                                                   Descrizione                                                   |
|       1        |    Sistema: Chiede il codice del network `networkCode` e l'intervallo temporale [ `startDate`, `endDate` ].     |
|       2        |                              User: Inserisce `networkCode`,`startDate`, `endDate`.                              |
|       3        |            Sistema: Verifica la presenza di un token valido nella richiesta. Il token risulta valido            |
|       4        |                                         Sistema: Legge i dati forniti.                                          |
|       5        |             Sistema: Ricerca il network avente il codice fornito. Il codice network risulta valido.             |
|       6        |                       Sistema: Converte `startDate` e `endDate` da localTimezone a UTC+0                        |
|       7        | Sistema: Recupera le misurazioni del network con codice `networkCode` ed effettuate tra `startDate` e `endDate` |
|       8        |                              Sistema: Verifica che ci sia almeno una misurazione.                               |
|       9        |                            Sistema: non recupera nessuna misurazione nell'intervallo                            |
|       10       |                      Sistema: comunica l'assenza di misurazioni nell'intervallo richiesto                       |

#### Scenario C.5

|  Scenario C.5  |                                                  Visualizzazione media per un Sensore specifico                                                   |
| :------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------: |
|  Precondition  |                                                              L'utente è autenticato.                                                              |
| Post condition |                                                           L'utente visualizza la media                                                            |
|     Step#      |                                                                    Descrizione                                                                    |
|       1        | Sistema: Chiede il codice del network `networkCode`, l'indirizzo MAC del sensore `sensorMAC` e l'intervallo temporale [ `startDate`, `endDate` ]. |
|       2        |                                        User: Inserisce `networkCode`,`networkCode`,`startDate`, `endDate`.                                        |
|       3        |                             Sistema: Verifica la presenza di un token valido nella richiesta. Il token risulta valido                             |
|       4        |                                                          Sistema: Legge i dati forniti.                                                           |
|       5        |                              Sistema: Ricerca il network avente il codice fornito. Il codice network risulta valido.                              |
|       6        |                       Sistema: Ricerca il sensore avente il MAC fornito all'interno del network. Il sensore viene trovato.                        |
|       7        |                                        Sistema: Converte `startDate` e `endDate` da localTimezone a UTC+0                                         |
|       8        |                  Sistema: Recupera le misurazioni del network con codice `networkCode` ed effettuate tra `startDate` e `endDate`                  |
|       9        |                                                             Sistema: calcola la media                                                             |
|       11       |                                                        Sistema: invia la media all'utente                                                         |
|       12       |                                                         Utente: legge la media richieste                                                          |

# Glossary

\<use UML class diagram to define important terms, or concepts in the domain of the application, and their relationships>

\<concepts must be used consistently all over the document, ex in use cases, requirements etc>

# System Design

\<describe here system design>

\<must be consistent with Context diagram>

# Deployment Diagram

\<describe here deployment diagram >
