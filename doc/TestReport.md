# Test Report

<The goal of this document is to explain how the application was tested, detailing how the test cases were defined and what they cover>

# Contents

- [Test Report](#test-report)
- [Contents](#contents)
- [Dependency graph](#dependency-graph)
- [Integration approach](#integration-approach)
- [Tests](#tests)
- [Coverage](#coverage)
  - [Coverage of FR](#coverage-of-fr)
  - [Coverage white box](#coverage-white-box)

# Dependency graph

     <report the here the dependency graph of EzElectronics>

# Integration approach

**General approach:**

AWBiamo adottato un approccio misto al testing, combinando tecniche white-box e black-box, seguendo una progressione strutturata:

Bottom-Up white-box per unit test e integration test interni (Repository → Controller → Route)
Top-Down black-box per i test end-to-end, simulando vere richieste HTTP

Questo ci ha permesso di testare in modo approfondito sia le singole componenti, sia il sistema nel suo insieme, assicurandoci che tutto funzionasse correttamente sia a livello interno che dal punto di vista dell’utente.

**Vantaggi**

• Affidabilità progressiva: ogni componente viene testata singolarmente prima di essere integrata, riducendo il rischio di errori non localizzati.

• Copertura completa: combinando white-box e black-box, aWBiamo ottenuto una copertura sia della logica interna che del comportamento esterno del sistema.

• Individuazione rapida degli errori: i test white-box aiutano a trovare bug a livello di implementazione, mentre i test end-to-end evidenziano problemi nei flussi reali.

• Maggiore confidenza in fase di deploy: l’e2e testing simula l'esperienza utente reale, aumentando la sicurezza in fase di rilascio.

**Svantaggi**

• Tempo e complessità maggiori: scrivere test su più livelli (unitari, di integrazione e e2e) richiede più tempo e gestione accurata dei casi.

• Manutenzione: modifiche interne possono richiedere aggiornamenti su più livelli di test, specie quelli white-box.

• E2E più lenti e fragili: i test end-to-end, pur essendo utili, sono spesso più lenti da eseguire e più sensibili a cambiamenti nell'interfaccia o nei dati.

**Sequenza di testing:**

**Step 1:**
Unit testing (white-box) della Repository, testando in isolamento i metodi che interagiscono con il database.

**Step 2:**
Integration testing (white-box) dei Controller, verificandone il comportamento integrato con la Repository.

**Step 3:**
Integration testing (white-box) delle Route, testando i flussi tra Route, Controller e Repository.

**Step 4:**
End-to-End testing (black-box), effettuando chiamate HTTP reali alle Route dell’applicazione e confrontando i risultati ottenuti con quelli attesi, senza conoscere l’implementazione interna.

# Tests

<in the table below list the test cases defined For each test report the object tested, the test level (API, integration, unit) and the technique used to define the test case (WB/ eq partitioning, WB/ boundary, WB/ statement coverage, etc)> <split the table if needed>
| Test case name | Object(s) tested | Test level | Technique used |
| :------------------------------------------------------------------------------------------------------------------------------------: | :----------------------: | :--------------: | :-------------------------------------------: |
| **Review unit test** | | | |
| **User DAO unit test** | | | |
| Create user - success | UserRepository | Unit | WB/ Statement Coverage |
| Create user - ConflictError | UserRepository | Unit | WB/ Equivalence Partitioning |
| Create user - ConflictError with correct message | UserRepository | Unit | WB/ Boundary |
| Create user - Database error during save | UserRepository | Unit | WB/ Boundary |
| Create user - Database error during conflict check | UserRepository | Unit | WB/ Boundary |
| Find user by username - success | UserRepository | Unit | WB/ Statement Coverage |
| Find user by username - NotFoundError | UserRepository | Unit | WB/ Boundary |
| Find user by username - NotFoundError with correct message | UserRepository | Unit | WB/ Boundary |
| Find user by username - Database error | UserRepository | Unit | WB/ Boundary |
| Find user by username - Empty string | UserRepository | Unit | WB/ Boundary |
| Find user by username - Special characters | UserRepository | Unit | WB/ Equivalence Partitioning |
| Get all users - success | UserRepository | Unit | WB/ Statement Coverage |
| Get all users - success (empty array) | UserRepository | Unit | WB/ Statement Coverage |
| Get all users - success (single user) | UserRepository | Unit | WB/ Statement Coverage |
| Get all users - Database error | UserRepository | Unit | WB/ Boundary |
| Get all users - Mixed user types | UserRepository | Unit | WB/ Equivalence Partitioning |
| Delete user - success | UserRepository | Unit | WB/ Statement Coverage |
| Delete user - NotFoundError | UserRepository | Unit | WB/ Boundary |
| Delete user - Database error during find | UserRepository | Unit | WB/ Boundary |
| Delete user - Database error during remove | UserRepository | Unit | WB/ Boundary |
| Delete user - Empty string | UserRepository | Unit | WB/ Boundary |
| Delete user - Special characters | UserRepository | Unit | WB/ Equivalence Partitioning |
| Repository creation - success | UserRepository | Unit | WB/ Statement Coverage |
| MockFind called with correct parameters | UserRepository | Unit | WB/ Statement Coverage |
| **Measurement DAO unit test** | | | |
| get measurement by network with list of sensors mac with all sensors of other networks | MeasurementRepository | Unit | WB/ Statement Coverage |
| get measurements by network with list of sensors mac with no measurements | MeasurementRepository | Unit | WB/ Statement Coverage |
| create and retrieve multiple measurements for the same sensor | MeasurementRepository | Unit | WB/ Statement Coverage |
| get measurement by network with invalid sensor mac addresses | MeasurementRepository | Unit | WB/ Boundary |
| get measurement by network with empty sensor mac list | MeasurementRepository | Unit | WB/ Equivalence Partitioning |
| get measurement by network with date range filtering | MeasurementRepository | Unit | WB/ Boundary |
| create measurement with invalid sensor mac address | MeasurementRepository | Unit | WB/ Boundary |
| create measurement with missing value | MeasurementRepository | Unit | WB/ Boundary |
| create measurement with invalid timestamp | MeasurementRepository | Unit | WB/ Boundary |
| retrieve measurements for non-existent network | MeasurementRepository | Unit | WB/ Boundary |
| retrieve measurements for sensors with mixed network associations | MeasurementRepository | Unit | WB/ Equivalence Partitioning |
| **Network DAO unit test** | | |
| Create new network: all fields | NetworkRepository | Unit | WB/ Statement Coverage |
| Create new network: no description | NetworkRepository | Unit | WB/ Statement Coverage |
| Create new network: no name | NetworkRepository | Unit | WB/ Statement Coverage |
| Create new network: no name & description | NetworkRepository | Unit | WB/ Statement Coverage |
| Create new network: conflict | NetworkRepository | Unit | WB/ Equivalence Partitioning |
| Get all networks: ok, no networks present | NetworkRepository | Unit | WB/ Statement Coverage |
| Get all networks: ok, two networks present | NetworkRepository | Unit | WB/ Statement Coverage |
| Get specific network: ok | NetworkRepository | Unit | WB/ Statement Coverage |
| Get specific network: network not found | NetworkRepository | Unit | WB/ Boundary |
| Update network: ok, change all | NetworkRepository | Unit | WB/ Statement Coverage |
| Update network: ok, change only optionals | NetworkRepository | Unit | WB/ Statement Coverage |
| Update network: ok, change only code | NetworkRepository | Unit | WB/ Statement Coverage |
| Update network: network not found | NetworkRepository | Unit | WB/ Boundary |
| Update network: network code already in use | NetworkRepository | Unit | WB/ Equivalence Partitioning |
| Delete network: ok | NetworkRepository | Unit | WB/ Statement Coverage |
| Delete network: network not found | NetworkRepository | Unit | WB/ Boundary |
| **Gateway DAO unit test** | | |
| Create new Gateway: success | GatewayRepository | Unit | WB/ Statement Coverage |
| Create new Gateway (solo campi oWBligatori): success | GatewayRepository | Unit | WB/ Statement Coverage |
| Create new Gateway: MacAddress già esistente | GatewayRepository | Unit | WB/ Equivalence Partitioning |
| Create new Gateway: MacAddress già esistente (sensor conflict) | GatewayRepository | Unit | WB/ Equivalence Partitioning |
| Create new Gateway: network inesistente | GatewayRepository | Unit | WB/ Boundary |
| Create new Gateway: macAddress già esistente in un'altra network | GatewayRepository | Unit | WB/ Equivalence Partitioning |
| Get All Gateways: success (array vuoto) | GatewayRepository | Unit | WB/ Statement Coverage |
| Get All Gateways: success | GatewayRepository | Unit | WB/ Statement Coverage |
| Get All Gateways: con più reti deve ritornare solo i gateway della rete selezionata | GatewayRepository | Unit | WB/ Statement Coverage |
| Get Gateway By macAddress: success | GatewayRepository | Unit | WB/ Statement Coverage |
| Get Gateway By macAddress: macAddress inesistente | GatewayRepository | Unit | WB/ Boundary |
| Get Gateway By macAddress: macAddress esistente ma in un'altra rete | GatewayRepository | Unit | WB/ Boundary |
| Update Gateway: name and description senza cambiare macAddress | GatewayRepository | Unit | WB/ Statement Coverage |
| Update Gateway: update macAddress | GatewayRepository | Unit | WB/ Statement Coverage |
| Update Gateway: Gateway non esistente | GatewayRepository | Unit | WB/ Boundary |
| Update Gateway: nuovo macAddress già esistente | GatewayRepository | Unit | WB/ Equivalence Partitioning |
| Update Gateway: aggiorna solo alcuni campi (gestione caso undefined) | GatewayRepository | Unit | WB/ Statement Coverage |
| Update Gateway: aggiorna con stringa vuota | GatewayRepository | Unit | WB/ Boundary |
| Update Gateway: macAddress esistente in un'altra network | GatewayRepository | Unit | WB/ Boundary |
| Delete Gateway: success | GatewayRepository | Unit | WB/ Statement Coverage |
| Delete Gateway: gateway inesistente | GatewayRepository | Unit | WB/ Boundary |
| Delete Gateway: gateway esistente ma in un'altra rete | GatewayRepository | Unit | WB/ Boundary |
| Gestione di più gateway con operazioni in cascata | GatewayRepository | Unit | WB/ Statement Coverage |
| Integrità dei dati durante le operazioni | GatewayRepository | Unit | WB/ Statement Coverage |
| **Sensor DAO unit test** | | |
| Create new Sensor: success | SensorRepository | Integration | WB/ Statement Coverage |
| Create new Sensor (solo campi oWBligatori): success | SensorRepository | Integration | WB/ Statement Coverage |
| Create new Sensor: MacAddress già esistente associato ad un altro sensore | SensorRepository | Integration | WB/ Equivalence Partitioning |
| Create new Sensor: MacAddress già esistente associato ad un gateway | SensorRepository | Integration | WB/ Equivalence Partitioning |
| Get Sensor By macAddress: success | SensorRepository | Integration | WB/ Statement Coverage |
| Get Sensor By macAddress: macAddress inesistente | SensorRepository | Integration | WB/ Boundary |
| Restituisce tutti i sensori associati alla rete quando sensorArray è undefined | SensorRepository | Integration | WB/ Statement Coverage |
| Restituisce solo i sensori specificati in sensorArray | SensorRepository | Integration | WB/ Statement Coverage |
| Get all Sensor: success | SensorRepository | Integration | WB/ Statement Coverage |
| Get all Sensor: Nessun sensore associato al gateway | SensorRepository | Integration | WB/ Statement Coverage |
| Get all Sensor: Filtra solo i sensori appartenenti al gateway | SensorRepository | Integration | WB/ Statement Coverage |
| Delete Sensor: success | SensorRepository | Integration | WB/ Statement Coverage |
| Delete Sensor: Sensor inesistente | SensorRepository | Integration | WB/ Boundary |
| Update Sensor: success | SensorRepository | Integration | WB/ Statement Coverage |
| Update Sensor: campi opzionali vuoti | SensorRepository | Integration | WB/ Statement Coverage |
| Update Sensor: macAddress già esistente | SensorRepository | Integration | WB/ Equivalence Partitioning |
| Update Sensor: macAddress inesistente | SensorRepository | Integration | WB/ Boundary |

| **Review Controller Integration test** | | |
| **User Controller Integration test** | | |
| Create user: success | UserController | Integration | WB/ Statement Coverage |
| Create user: success (admin user) | UserController | Integration | WB/ Statement Coverage |
| Create user: success (viewer user) | UserController | Integration | WB/ Statement Coverage |
| Create user: ConflictError (user già esistente) | UserController | Integration | WB/ Equivalence Partitioning |
| Create user: Gestione di errori del database durante la creazione | UserController | Integration | WB/ Boundary |
| Get User: success (user DTO senza password) | UserController | Integration | WB/ Statement Coverage |
| Get User: success (admin user) | UserController | Integration | WB/ Statement Coverage |
| Get User: success (viewer user) | UserController | Integration | WB/ Statement Coverage |
| Get User: NotFoundError (user inesistente) | UserController | Integration | WB/ Boundary |
| Get All User: success (array di user DTOs senza password) | UserController | Integration | WB/ Statement Coverage |
| Get All User: success (array vuoto se non ci sono users) | UserController | Integration | WB/ Statement Coverage |
| Get All User: Gestione di errori nella repository | UserController | Integration | WB/ Boundary |
| Delete User: success | UserController | Integration | WB/ Statement Coverage |
| Delete User: success (delete admin user) | UserController | Integration | WB/ Statement Coverage |
| Delete User: success (delete viewer user) | UserController | Integration | WB/ Statement Coverage |
| Delete User: NotFoundError (user inesistente) | UserController | Integration | WB/ Boundary |
| Delete User: Gestione errori del database durante l'eliminazione | UserController | Integration | WB/ Boundary |
| Integrazione con mapUserDAOToDTO per diversi tipi di user | UserController | Integration | WB/ Statement Coverage |
| Il mapping dei dati tra getAllUsers e getUser è consistente | UserController | Integration | WB/ Statement Coverage |
| Gestione corretta dei caratteri speciali nell'username | UserController | Integration | WB/ Equivalence Partitioning |
| Gestione di username lunghi | UserController | Integration | WB/ Boundary |
| Gestione di repository che restituiscono null/undefined | UserController | Integration | WB/ Boundary |
| get User: mapperService integration | UserController | Integration | WB/ Statement Coverage |
| **Measurement Controller Integration test** | | |
| getMeasurementsByNetwork: success | MeasurementController | Unit | WB/ Statement Coverage |
| getMeasurementsByNetwork: success (con filtri per date) | MeasurementController | Unit | WB/ Boundary |
| getMeasurementsByNetwork: success (con filtri per sensorMacs) | MeasurementController | Unit | WB/ Equivalence Partitioning |
| getMeasurementsByNetwork: network inesistente | MeasurementController | Unit | WB/ Boundary |
| getMeasurementsByNetwork: nessun sensore associato alla rete | MeasurementController | Unit | WB/ Statement Coverage |
| getMeasurementsBySensor: success | MeasurementController | Unit | WB/ Statement Coverage |
| getMeasurementsBySensor: success (con filtri per date) | MeasurementController | Unit | WB/ Boundary |
| getMeasurementsBySensor: sensor inesistente | MeasurementController | Unit | WB/ Boundary |
| getStatsByNetwork: success | MeasurementController | Unit | WB/ Statement Coverage |
| getStatsByNetwork: success (con filtri per date) | MeasurementController | Unit | WB/ Boundary |
| getStatsByNetwork: success (con filtri per sensorMacs) | MeasurementController | Unit | WB/ Equivalence Partitioning |
| getStatsByNetwork: network inesistente | MeasurementController | Unit | WB/ Boundary |
| getStatsBySensor: success | MeasurementController | Unit | WB/ Statement Coverage |
| getStatsBySensor: success (con filtri per date) | MeasurementController | Unit | WB/ Boundary |
| getStatsBySensor: sensor inesistente | MeasurementController | Unit | WB/ Boundary |
| getOutliersByNetwork: success | MeasurementController | Unit | WB/ Statement Coverage |
| getOutliersByNetwork: success (con filtri per date) | MeasurementController | Unit | WB/ Boundary |
| getOutliersByNetwork: success (con filtri per sensorMacs) | MeasurementController | Unit | WB/ Equivalence Partitioning |
| getOutliersByNetwork: network inesistente | MeasurementController | Unit | WB/ Boundary |
| getOutliersBySensor: success | MeasurementController | Unit | WB/ Statement Coverage |
| getOutliersBySensor: success (con filtri per date) | MeasurementController | Unit | WB/ Boundary |
| getOutliersBySensor: sensor inesistente | MeasurementController | Unit | WB/ Boundary |
| createMeasurement: success | MeasurementController | Unit | WB/ Statement Coverage |
| createMeasurement: sensor inesistente | MeasurementController | Unit | WB/ Boundary |
| createMeasurement: errore nel repository | MeasurementController | Unit | WB/ Boundary |
| **Network Controller Integration test** | | |
| Create network: ok | NetworkController | Integration | WB/ Statement Coverage |
| Create network: ok, solo campi oWBligatori | NetworkController | Integration | WB/ Statement Coverage |
| Create network: code already in use | NetworkController | Integration | WB/ Equivalence Partitioning |
| Get all networks: ok, array vuoto | NetworkController | Integration | WB/ Statement Coverage |
| Get all networks: ok, tre networks | NetworkController | Integration | WB/ Statement Coverage |
| Get specific network: ok, tutti i campi | NetworkController | Integration | WB/ Statement Coverage |
| Get specific network: ok, no name | NetworkController | Integration | WB/ Statement Coverage |
| Get specific network: ok, no name & description | NetworkController | Integration | WB/ Statement Coverage |
| Get specific network: code not found | NetworkController | Integration | WB/ Boundary |
| Update network: ok, cambio campi opzionali | NetworkController | Integration | WB/ Statement Coverage |
| Update network: ok, cambio tutti i campi | NetworkController | Integration | WB/ Statement Coverage |
| Update network: code not found | NetworkController | Integration | WB/ Boundary |
| Update network: code already used | NetworkController | Integration | WB/ Equivalence Partitioning |
| Delete network: ok | NetworkController | Integration | WB/ Statement Coverage |
| Delete network: code not found | NetworkController | Integration | WB/ Boundary |
| **Gateway Controller Integration test** | | |
| Create Gateway: success | GatewayController | Unit | WB/ Statement Coverage |
| Create Gateway: network inesistente | GatewayController | Unit | WB/ Boundary |
| Create Gateway: macAddress già esistente | GatewayController | Unit | WB/ Equivalence Partitioning |
| Create Gateway: Errore nella repository | GatewayController | Unit | WB/ Boundary |
| Get All Gateways: success | GatewayController | Unit | WB/ Statement Coverage |
| Get All Gateways: network senza gateways ritorna array vuoto | GatewayController | Unit | WB/ Statement Coverage |
| Get All Gateways: network inesistente | GatewayController | Unit | WB/ Boundary |
| Get All Gateways: Errore nella repository | GatewayController | Unit | WB/ Boundary |
| Get Gateway By MacAddress: success | GatewayController | Unit | WB/ Statement Coverage |
| Get Gateway By MacAddress: network inesistente | GatewayController | Unit | WB/ Boundary |
| Get Gateway By MacAddress: gateway inesistente | GatewayController | Unit | WB/ Boundary |
| Get Gateway By MacAddress: Errore nella repository | GatewayController | Unit | WB/ Boundary |
| Delete Gateway: success | GatewayController | Unit | WB/ Statement Coverage |
| Delete Gateway: network inesistente | GatewayController | Unit | WB/ Boundary |
| Delete Gateway: gateway inesistente | GatewayController | Unit | WB/ Boundary |
| Delete Gateway: Errore nella repository | GatewayController | Unit | WB/ Boundary |
| Update Gateway: success | GatewayController | Unit | WB/ Statement Coverage |
| Update Gateway senza cambiare macAddress | GatewayController | Unit | WB/ Statement Coverage |
| Update Gateway: network inesistente | GatewayController | Unit | WB/ Boundary |
| Update Gateway: macAddress inesistente | GatewayController | Unit | WB/ Boundary |
| **Sensor Controller unit test** | | |
| getAllSensors: success | SensorController | Unit | WB/ Statement Coverage |
| getAllSensors: success (nessun sensore associato al gateway) | SensorController | Unit | WB/ Statement Coverage |
| getAllSensors: network inesistente | SensorController | Unit | WB/ Boundary |
| getAllSensors: gateway inesistente | SensorController | Unit | WB/ Boundary |
| getSensor: success | SensorController | Unit | WB/ Statement Coverage |
| getSensor: network inesistente | SensorController | Unit | WB/ Boundary |
| getSensor: gateway inesistente | SensorController | Unit | WB/ Boundary |
| getSensor: sensor inesistente | SensorController | Unit | WB/ Boundary |
| createSensor: success | SensorController | Unit | WB/ Statement Coverage |
| createSensor: network inesistente | SensorController | Unit | WB/ Boundary |
| createSensor: gateway inesistente | SensorController | Unit | WB/ Boundary |
| createSensor: macAddress già esistente | SensorController | Unit | WB/ Equivalence Partitioning |
| deleteSensor: success | SensorController | Unit | WB/ Statement Coverage |
| deleteSensor: network inesistente | SensorController | Unit | WB/ Boundary |
| deleteSensor: gateway inesistente | SensorController | Unit | WB/ Boundary |
| deleteSensor: sensor inesistente | SensorController | Unit | WB/ Boundary |
| updateSensor: success | SensorController | Unit | WB/ Statement Coverage |
| updateSensor: network inesistente | SensorController | Unit | WB/ Boundary |
| updateSensor: gateway inesistente | SensorController | Unit | WB/ Boundary |
| updateSensor: sensor inesistente | SensorController | Unit | WB/ Boundary |
| updateSensor: macAddress già esistente | SensorController | Unit | WB/ Equivalence Partitioning |
| **Auth Controller Integration test** | | |
| AuthController: Create token - success | Controller | Integration | WB/ Statement Coverage |
| AuthController: Create token - invalid password | Controller | Integration | WB/ Boundary |
| **Review Routes Integration test** | | |

# Coverage

## Coverage of FR

<Report in the following table the coverage of functional requirements and scenarios(from official requirements) >

| Functional Requirement or scenario | Test(s) |
| :--------------------------------: | :-----: |
|                FRx                 |         |
|                FRy                 |         |
|                ...                 |         |

## Coverage white box

Report here the screenshot of coverage values obtained with jest-- coverage
