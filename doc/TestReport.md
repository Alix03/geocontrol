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

Abbiamo adottato un approccio misto al testing, combinando tecniche white-box e black-box, seguendo una progressione strutturata:

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

<<<<<<< HEAD
<in the table below list the test cases defined For each test report the object tested, the test level (API, integration, unit) and the technique used to define the test case (WB/ eq partitioning, WB/ boundary, WB/ statement coverage, etc)> <split the table if needed>

### DAO unit test

|                  Test case name                   |   Object(s) tested    | Test level |     Technique used     |       Description       |
| :-----------------------------------------------: | :-------------------: | :--------: | :--------------------: | :---------------------: |
|              **User DAO unit test**               |                       |            |                        |                         |
|               Create user - success               |    UserRepository     |    Unit    | WB/ Statement Coverage | 4 Test caso di successo |
|                Create user - error                |    UserRepository     |    Unit    |      WB/ Boundary      |         1 Test          |
|          Find user by username - success          |    UserRepository     |    Unit    | WB/ Statement Coverage |
|           Find user by username - error           |    UserRepository     |    Unit    |      WB/ Boundary      |
|              Get all users - success              |    UserRepository     |    Unit    | WB/ Statement Coverage |
|               Get all users - error               |    UserRepository     |    Unit    |      WB/ Boundary      |
|               Delete user - success               |    UserRepository     |    Unit    | WB/ Statement Coverage |
|                Delete user -error                 |    UserRepository     |    Unit    |   WB/ Boundary - EP    |                         |
|           **Measurement DAO unit test**           |                       |            |                        |
|           Create measurement - success            | MeasurementRepository |    Unit    | WB/ Statement Coverage |
|            Create measurement - error             | MeasurementRepository |    Unit    |      WB/ Boundary      |
|       Get measurement by network - success        | MeasurementRepository |    Unit    | WB/ Statement Coverage |
|        Get measurement by network - error         | MeasurementRepository |    Unit    |      WB/ Boundary      |
| Get measurement by network with filters - success | MeasurementRepository |    Unit    | WB/ Statement Coverage |
|  Get measurement by network with filters - error  | MeasurementRepository |    Unit    |      WB/ Boundary      |
|        Get measurement by sensor - success        | MeasurementRepository |    Unit    | WB/ Statement Coverage |
|         Get measurement by sensor - error         | MeasurementRepository |    Unit    |      WB/ Boundary      |
| Get measurement by sensor with filters - success  | MeasurementRepository |    Unit    | WB/ Statement Coverage |
|  Get measurement by sensor with filters - error   | MeasurementRepository |    Unit    |      WB/ Boundary      |
|             **Network DAO unit test**             |                       |            |
|             Create network - success              |   NetworkRepository   |    Unit    | WB/ Statement Coverage |
|              Create network - error               |   NetworkRepository   |    Unit    |      WB/ Boundary      |
|            Get all networks - success             |   NetworkRepository   |    Unit    | WB/ Statement Coverage |
|             Get all networks - error              |   NetworkRepository   |    Unit    |      WB/ Boundary      |
|           Get network by code - success           |   NetworkRepository   |    Unit    | WB/ Statement Coverage |
|            Get network by code - error            |   NetworkRepository   |    Unit    |      WB/ Boundary      |
|             Update network - success              |   NetworkRepository   |    Unit    | WB/ Statement Coverage |
|              Update network - error               |   NetworkRepository   |    Unit    |      WB/ Boundary      |
|             Delete network - success              |   NetworkRepository   |    Unit    | WB/ Statement Coverage |
|              Delete network - error               |   NetworkRepository   |    Unit    |      WB/ Boundary      |
|             **Gateway DAO unit test**             |                       |            |
|             Create gateway - success              |   GatewayRepository   |    Unit    | WB/ Statement Coverage |
|              Create gateway - error               |   GatewayRepository   |    Unit    |      WB/ Boundary      |
|            Get all gateways - success             |   GatewayRepository   |    Unit    | WB/ Statement Coverage |
|             Get all gateways - error              |   GatewayRepository   |    Unit    |      WB/ Boundary      |
|        Get gateway by macAddress - success        |   GatewayRepository   |    Unit    | WB/ Statement Coverage |
|         Get gateway by macAddress - error         |   GatewayRepository   |    Unit    |      WB/ Boundary      |
|             Update gateway - success              |   GatewayRepository   |    Unit    | WB/ Statement Coverage |
|              Update gateway - error               |   GatewayRepository   |    Unit    |      WB/ Boundary      |
|             Delete gateway - success              |   GatewayRepository   |    Unit    | WB/ Statement Coverage |
|              Delete gateway - error               |   GatewayRepository   |    Unit    |      WB/ Boundary      |
|             **Sensor DAO unit test**              |                       |            |
|              Create sensor - success              |   SensorRepository    |    Unit    | WB/ Statement Coverage |
|               Create sensor - error               |   SensorRepository    |    Unit    |      WB/ Boundary      |
|        Get sensor by macAddress - success         |   SensorRepository    |    Unit    | WB/ Statement Coverage |
|         Get sensor by macAddress - error          |   SensorRepository    |    Unit    |      WB/ Boundary      |
|       Get all sensors by network - success        |   SensorRepository    |    Unit    | WB/ Statement Coverage |
|        Get all sensors by network - error         |   SensorRepository    |    Unit    |      WB/ Boundary      |
|              Update sensor - success              |   SensorRepository    |    Unit    | WB/ Statement Coverage |
|               Update sensor - error               |   SensorRepository    |    Unit    |      WB/ Boundary      |
|              Delete sensor - success              |   SensorRepository    |    Unit    | WB/ Statement Coverage |
|               Delete sensor - error               |   SensorRepository    |    Unit    |      WB/ Boundary      |

### INTEGRATION TEST - CONTROLLER

|                        Test case name                         |   Object(s) tested    | Test level  |        Technique used        |
| :-----------------------------------------------------------: | :-------------------: | :---------: | :--------------------------: |
|             **User Controller Integration test**              |                       |             |
|                     Create user - success                     |    UserController     | Integration |    WB/ Statement Coverage    |
|                      Create user - error                      |    UserController     | Integration |         WB/ Boundary         |
|                Get user by username - success                 |    UserController     | Integration |    WB/ Statement Coverage    |
|                 Get user by username - error                  |    UserController     | Integration |         WB/ Boundary         |
|                    Get all users - success                    |    UserController     | Integration |    WB/ Statement Coverage    |
|                     Get all users - error                     |    UserController     | Integration |         WB/ Boundary         |
|                     Delete user - success                     |    UserController     | Integration |    WB/ Statement Coverage    |
|                      Delete user - error                      |    UserController     | Integration |         WB/ Boundary         |
|              MapperService integration - success              |    UserController     | Integration |    WB/ Statement Coverage    |
|               MapperService integration - error               |    UserController     | Integration |         WB/ Boundary         |
|      Gestione caratteri speciali nell'username - success      |    UserController     | Integration |    WB/ Statement Coverage    |
|       Gestione caratteri speciali nell'username - error       |    UserController     | Integration |         WB/ Boundary         |
|              Gestione username lunghi - success               |    UserController     | Integration |    WB/ Statement Coverage    |
|               Gestione username lunghi - error                |    UserController     | Integration |         WB/ Boundary         |
|          **Measurement Controller Integration test**          |                       |             |
|               getMeasurementsByNetwork: success               | MeasurementController |    Unit     |    WB/ Statement Coverage    |
|    getMeasurementsByNetwork: success (con filtri per date)    | MeasurementController |    Unit     |         WB/ Boundary         |
| getMeasurementsByNetwork: success (con filtri per sensorMacs) | MeasurementController |    Unit     | WB/ Equivalence Partitioning |
|         getMeasurementsByNetwork: network inesistente         | MeasurementController |    Unit     |         WB/ Boundary         |
| getMeasurementsByNetwork: nessun sensore associato alla rete  | MeasurementController |    Unit     |    WB/ Statement Coverage    |
|               getMeasurementsBySensor: success                | MeasurementController |    Unit     |    WB/ Statement Coverage    |
|    getMeasurementsBySensor: success (con filtri per date)     | MeasurementController |    Unit     |         WB/ Boundary         |
|          getMeasurementsBySensor: sensor inesistente          | MeasurementController |    Unit     |         WB/ Boundary         |
|                  getStatsByNetwork: success                   | MeasurementController |    Unit     |    WB/ Statement Coverage    |
|       getStatsByNetwork: success (con filtri per date)        | MeasurementController |    Unit     |         WB/ Boundary         |
|    getStatsByNetwork: success (con filtri per sensorMacs)     | MeasurementController |    Unit     | WB/ Equivalence Partitioning |
|            getStatsByNetwork: network inesistente             | MeasurementController |    Unit     |         WB/ Boundary         |
|                   getStatsBySensor: success                   | MeasurementController |    Unit     |    WB/ Statement Coverage    |
|        getStatsBySensor: success (con filtri per date)        | MeasurementController |    Unit     |         WB/ Boundary         |
|             getStatsBySensor: sensor inesistente              | MeasurementController |    Unit     |         WB/ Boundary         |
|                 getOutliersByNetwork: success                 | MeasurementController |    Unit     |    WB/ Statement Coverage    |
|      getOutliersByNetwork: success (con filtri per date)      | MeasurementController |    Unit     |         WB/ Boundary         |
|   getOutliersByNetwork: success (con filtri per sensorMacs)   | MeasurementController |    Unit     | WB/ Equivalence Partitioning |
|           getOutliersByNetwork: network inesistente           | MeasurementController |    Unit     |         WB/ Boundary         |
|                 getOutliersBySensor: success                  | MeasurementController |    Unit     |    WB/ Statement Coverage    |
|      getOutliersBySensor: success (con filtri per date)       | MeasurementController |    Unit     |         WB/ Boundary         |
|            getOutliersBySensor: sensor inesistente            | MeasurementController |    Unit     |         WB/ Boundary         |
|                  createMeasurement: success                   | MeasurementController |    Unit     |    WB/ Statement Coverage    |
|             createMeasurement: sensor inesistente             | MeasurementController |    Unit     |         WB/ Boundary         |
|           createMeasurement: errore nel repository            | MeasurementController |    Unit     |         WB/ Boundary         |
|            **Network Controller Integration test**            |                       |             |
|                      Create network: ok                       |   NetworkController   | Integration |    WB/ Statement Coverage    |
|          Create network: ok, solo campi oWBligatori           |   NetworkController   | Integration |    WB/ Statement Coverage    |
|              Create network: code already in use              |   NetworkController   | Integration | WB/ Equivalence Partitioning |
|               Get all networks: ok, array vuoto               |   NetworkController   | Integration |    WB/ Statement Coverage    |
|              Get all networks: ok, tre networks               |   NetworkController   | Integration |    WB/ Statement Coverage    |
|            Get specific network: ok, tutti i campi            |   NetworkController   | Integration |    WB/ Statement Coverage    |
|               Get specific network: ok, no name               |   NetworkController   | Integration |    WB/ Statement Coverage    |
|        Get specific network: ok, no name & description        |   NetworkController   | Integration |    WB/ Statement Coverage    |
|             Get specific network: code not found              |   NetworkController   | Integration |         WB/ Boundary         |
|          Update network: ok, cambio campi opzionali           |   NetworkController   | Integration |    WB/ Statement Coverage    |
|           Update network: ok, cambio tutti i campi            |   NetworkController   | Integration |    WB/ Statement Coverage    |
|                Update network: code not found                 |   NetworkController   | Integration |         WB/ Boundary         |
|               Update network: code already used               |   NetworkController   | Integration | WB/ Equivalence Partitioning |
|                      Delete network: ok                       |   NetworkController   | Integration |    WB/ Statement Coverage    |
|                Delete network: code not found                 |   NetworkController   | Integration |         WB/ Boundary         |
|            **Gateway Controller Integration test**            |                       |             |
|                    Create Gateway: success                    |   GatewayController   |    Unit     |    WB/ Statement Coverage    |
|              Create Gateway: network inesistente              |   GatewayController   |    Unit     |         WB/ Boundary         |
|           Create Gateway: macAddress già esistente            |   GatewayController   |    Unit     | WB/ Equivalence Partitioning |
|            Create Gateway: Errore nella repository            |   GatewayController   |    Unit     |         WB/ Boundary         |
|                   Get All Gateways: success                   |   GatewayController   |    Unit     |    WB/ Statement Coverage    |
| Get All Gateways: network senza gateways ritorna array vuoto  |   GatewayController   |    Unit     |    WB/ Statement Coverage    |
|             Get All Gateways: network inesistente             |   GatewayController   |    Unit     |         WB/ Boundary         |
|           Get All Gateways: Errore nella repository           |   GatewayController   |    Unit     |         WB/ Boundary         |
|              Get Gateway By MacAddress: success               |   GatewayController   |    Unit     |    WB/ Statement Coverage    |
|        Get Gateway By MacAddress: network inesistente         |   GatewayController   |    Unit     |         WB/ Boundary         |
|        Get Gateway By MacAddress: gateway inesistente         |   GatewayController   |    Unit     |         WB/ Boundary         |
|      Get Gateway By MacAddress: Errore nella repository       |   GatewayController   |    Unit     |         WB/ Boundary         |
|                    Delete Gateway: success                    |   GatewayController   |    Unit     |    WB/ Statement Coverage    |
|              Delete Gateway: network inesistente              |   GatewayController   |    Unit     |         WB/ Boundary         |
|              Delete Gateway: gateway inesistente              |   GatewayController   |    Unit     |         WB/ Boundary         |
|            Delete Gateway: Errore nella repository            |   GatewayController   |    Unit     |         WB/ Boundary         |
|                    Update Gateway: success                    |   GatewayController   |    Unit     |    WB/ Statement Coverage    |
|           Update Gateway senza cambiare macAddress            |   GatewayController   |    Unit     |    WB/ Statement Coverage    |
|              Update Gateway: network inesistente              |   GatewayController   |    Unit     |         WB/ Boundary         |
|            Update Gateway: macAddress inesistente             |   GatewayController   |    Unit     |         WB/ Boundary         |
|                **Sensor Controller unit test**                |                       |             |
|                    getAllSensors: success                     |   SensorController    |    Unit     |    WB/ Statement Coverage    |
| getAllSensors: success (nessun sensore associato al gateway)  |   SensorController    |    Unit     |    WB/ Statement Coverage    |
|              getAllSensors: network inesistente               |   SensorController    |    Unit     |         WB/ Boundary         |
|              getAllSensors: gateway inesistente               |   SensorController    |    Unit     |         WB/ Boundary         |
|                      getSensor: success                       |   SensorController    |    Unit     |    WB/ Statement Coverage    |
|                getSensor: network inesistente                 |   SensorController    |    Unit     |         WB/ Boundary         |
|                getSensor: gateway inesistente                 |   SensorController    |    Unit     |         WB/ Boundary         |
|                 getSensor: sensor inesistente                 |   SensorController    |    Unit     |         WB/ Boundary         |
|                     createSensor: success                     |   SensorController    |    Unit     |    WB/ Statement Coverage    |
|               createSensor: network inesistente               |   SensorController    |    Unit     |         WB/ Boundary         |
|               createSensor: gateway inesistente               |   SensorController    |    Unit     |         WB/ Boundary         |
|            createSensor: macAddress già esistente             |   SensorController    |    Unit     | WB/ Equivalence Partitioning |
|                     deleteSensor: success                     |   SensorController    |    Unit     |    WB/ Statement Coverage    |
|               deleteSensor: network inesistente               |   SensorController    |    Unit     |         WB/ Boundary         |
|               deleteSensor: gateway inesistente               |   SensorController    |    Unit     |         WB/ Boundary         |
|               deleteSensor: sensor inesistente                |   SensorController    |    Unit     |         WB/ Boundary         |
|                     updateSensor: success                     |   SensorController    |    Unit     |    WB/ Statement Coverage    |
|               updateSensor: network inesistente               |   SensorController    |    Unit     |         WB/ Boundary         |
|               updateSensor: gateway inesistente               |   SensorController    |    Unit     |         WB/ Boundary         |
|               updateSensor: sensor inesistente                |   SensorController    |    Unit     |         WB/ Boundary         |
|            updateSensor: macAddress già esistente             |   SensorController    |    Unit     | WB/ Equivalence Partitioning |
|             **Auth Controller Integration test**              |                       |             |
|            AuthController: Create token - success             |      Controller       | Integration |    WB/ Statement Coverage    |
|        AuthController: Create token - invalid password        |      Controller       | Integration |         WB/ Boundary         |

### INTEGRATION TEST - ROUTES

|               Test case name                |   Object(s) tested   | Test level  |       Technique used        |
| :-----------------------------------------: | :------------------: | :---------: | :-------------------------: |
|      **User Routes integration test**       |                      |             |
|            Create user - success            |      UserRoutes      | Integration |   WB/ Statement Coverage    |
|             Create user - error             |      UserRoutes      | Integration |      WB/ Boundary - EP      |
|           Get all users - success           |      UserRoutes      | Integration |   WB/ Statement Coverage    |
|            Get all users - error            |      UserRoutes      | Integration |        WB/ Boundary         |
|       Get user by username - success        |      UserRoutes      | Integration | WB/ Statement Coverage - EP |
|        Get user by username - error         |      UserRoutes      | Integration |        WB/ Boundary         |
|            Delete user - success            |      UserRoutes      | Integration |   WB/ Statement Coverage    |
|             Delete user - error             |      UserRoutes      | Integration |      WB/ Boundary - EP      |
|   **Measurement Routes integration test**   |                      |             |                             |
|        Create measurement - success         |  MeasurementRoutes   | Integration |   WB/ Statement Coverage    |
|         Create measurement - error          |  MeasurementRoutes   | Integration |        WB/ Boundary         |
|    Get measurement by network - success     |  MeasurementRoutes   | Integration |   WB/ Statement Coverage    |
|     Get measurement by network - error      |  MeasurementRoutes   | Integration |        WB/ Boundary         |
|     Get measurement by sensor - success     |  MeasurementRoutes   | Integration |   WB/ Statement Coverage    |
|      Get measurement by sensor - error      |  MeasurementRoutes   | Integration |        WB/ Boundary         |
|     Get Stats by Network Code - success     |  MeasurementRoutes   | Integration |   WB/ Statement Coverage    |
|      Get Stats by Network Code - error      |  MeasurementRoutes   | Integration |        WB/ Boundary         |
|  Get Stats by Sensor MacAddress - success   |  MeasurementRoutes   | Integration |   WB/ Statement Coverage    |
|   Get Stats by Sensor MacAddress - error    |  MeasurementRoutes   | Integration |        WB/ Boundary         |
|   Get Outliers by Network Code - success    |  MeasurementRoutes   | Integration |   WB/ Statement Coverage    |
|    Get Outliers by Network Code - error     |  MeasurementRoutes   | Integration |        WB/ Boundary         |
| Get Outliers by Sensor MacAddress - success |  MeasurementRoutes   | Integration |   WB/ Statement Coverage    |
|  Get Outliers by Sensor MacAddress - error  |  MeasurementRoutes   | Integration |        WB/ Boundary         |
|     **Network Routes integration test**     |                      |             |
|          Create network - success           |    NetworkRoutes     | Integration |   WB/ Statement Coverage    |
|           Create network - error            |    NetworkRoutes     | Integration |      WB/ Boundary - EP      |
|         Get all networks - success          |    NetworkRoutes     | Integration |   WB/ Statement Coverage    |
|          Get all networks - error           |    NetworkRoutes     | Integration |        WB/ Boundary         |
|        Get network by code - success        |    NetworkRoutes     | Integration |   WB/ Statement Coverage    |
|         Get network by code - error         |    NetworkRoutes     | Integration |        WB/ Boundary         |
|          Update network - success           |    NetworkRoutes     | Integration |   WB/ Statement Coverage    |
|           Update network - error            |    NetworkRoutes     | Integration |      WB/ Boundary - EP      |
|          Delete network - success           |    NetworkRoutes     | Integration |   WB/ Statement Coverage    |
|           Delete network - error            |    NetworkRoutes     | Integration |        WB/ Boundary         |
|     **Gateway Routes integration test**     |                      |             |
|          Create Gateway - success           |    GatewayRoutes     | Integration |   WB/ Statement Coverage    |
|           Create Gateway - error            |    GatewayRoutes     | Integration |      WB/ Boundary - EP      |
|         Get All Gateways - success          |    GatewayRoutes     | Integration |   WB/ Statement Coverage    |
|          Get All Gateways - error           |    GatewayRoutes     | Integration |        WB/ Boundary         |
|     Get Gateway By MacAddress - success     |    GatewayRoutes     | Integration |   WB/ Statement Coverage    |
|      Get Gateway By MacAddress - error      |    GatewayRoutes     | Integration |        WB/ Boundary         |
|          Update Gateway - success           |    GatewayRoutes     | Integration |   WB/ Statement Coverage    |
|           Update Gateway - error            |    GatewayRoutes     | Integration |      WB/ Boundary - EP      |
|          Delete Gateway - success           |    GatewayRoutes     | Integration |   WB/ Statement Coverage    |
|           Delete Gateway - error            |    GatewayRoutes     | Integration |        WB/ Boundary         |
|     **Sensor Routes integration test**      |                      |             |
|           Create Sensor - success           |     SensorRoutes     | Integration |   WB/ Statement Coverage    |
|            Create Sensor - error            |     SensorRoutes     | Integration |      WB/ Boundary -EP       |
|          Get All Sensors - success          |     SensorRoutes     | Integration |   WB/ Statement Coverage    |
|           Get All Sensors - error           |     SensorRoutes     | Integration |        WB/ Boundary         |
|            Get Sensor - success             |     SensorRoutes     | Integration |   WB/ Statement Coverage    |
|             Get Sensor - error              |     SensorRoutes     | Integration |        WB/ Boundary         |
|           Delete Sensor - success           |     SensorRoutes     | Integration |   WB/ Statement Coverage    |
|            Delete Sensor - error            |     SensorRoutes     | Integration |        WB/ Boundary         |
|           Update Sensor - success           |     SensorRoutes     | Integration |   WB/ Statement Coverage    |
|            Update Sensor - error            |     SensorRoutes     | Integration |      WB/ Boundary - EP      |
| **Authentication Routes integration test**  |                      |             |
|           Authenticate - success            | AuthenticationRoutes | Integration |   WB/ Statement Coverage    |
|            Authenticate - error             | AuthenticationRoutes | Integration |        WB/ Boundary         |

### E2E TEST

|              Test case name               |  Object(s) tested  | Test level |  Technique used   |
| :---------------------------------------: | :----------------: | :--------: | :---------------: |
|            **Users E2E test**             |                    |            |                   |
|          Get All Users - success          |    UsersRoutes     |    E2E     | BB/ Boundary - EP |
|           Get All Users - error           |    UsersRoutes     |    E2E     | BB/ Boundary - EP |
|           Create user - success           |    UsersRoutes     |    E2E     | BB/ Boundary - EP |
|            Create user - error            |    UsersRoutes     |    E2E     | BB/ Boundary - EP |
|            Get User - success             |    UsersRoutes     |    E2E     | BB/ Boundary - EP |
|             Get User - error              |    UsersRoutes     |    E2E     | BB/ Boundary - EP |
|           Delete user - success           |    UsersRoutes     |    E2E     | BB/ Boundary - EP |
|            Delete user - error            |    UsersRoutes     |    E2E     | BB/ Boundary - EP |
|               Auth - error                |    UsersRoutes     |    E2E     | BB/ Boundary - EP |
|     Gestione user lifecycle completo      |    UsersRoutes     |    E2E     | BB/ Boundary - EP |
| Gestione creazioni/cancellazioni multiple |    UsersRoutes     |    E2E     | BB/ Boundary - EP |
|         **Measurements E2E test**         |                    |            |
|      Get all measurements - success       | MeasurementsRoutes |    E2E     | BB/ Boundary - EP |
|       Get all measurements - error        | MeasurementsRoutes |    E2E     | BB/ Boundary - EP |
|       Create measurement - success        | MeasurementsRoutes |    E2E     | BB/ Boundary - EP |
|        Create measurement - error         | MeasurementsRoutes |    E2E     | BB/ Boundary - EP |
|    Get measurement by sensor - success    | MeasurementsRoutes |    E2E     | BB/ Boundary - EP |
|     Get measurement by sensor - error     | MeasurementsRoutes |    E2E     | BB/ Boundary - EP |
|      Get stats by network - success       | MeasurementsRoutes |    E2E     | BB/ Boundary - EP |
|       Get stats by network - error        | MeasurementsRoutes |    E2E     | BB/ Boundary - EP |
|       Get stats by sensor - success       | MeasurementsRoutes |    E2E     | BB/ Boundary - EP |
|        Get stats by sensor - error        | MeasurementsRoutes |    E2E     | BB/ Boundary - EP |
|     Get outliers by network - success     | MeasurementsRoutes |    E2E     | BB/ Boundary - EP |
|      Get outliers by network - error      | MeasurementsRoutes |    E2E     | BB/ Boundary - EP |
|     Get outliers by sensor - success      | MeasurementsRoutes |    E2E     | BB/ Boundary - EP |
|      Get outliers by sensor - error       | MeasurementsRoutes |    E2E     | BB/ Boundary - EP |
|    Gestione ciclo completo misurazioni    | MeasurementsRoutes |    E2E     | BB/ Boundary - EP |
| Gestione creazioni/cancellazioni multiple | MeasurementsRoutes |    E2E     | BB/ Boundary - EP |
|           **Networks E2E test**           |                    |            |
|        Get all networks - success         |   NetworksRoutes   |    E2E     | BB/ Boundary - EP |
|         Get all networks - error          |   NetworksRoutes   |    E2E     | BB/ Boundary - EP |
|         Create network - success          |   NetworksRoutes   |    E2E     | BB/ Boundary - EP |
|          Create network - error           |   NetworksRoutes   |    E2E     | BB/ Boundary - EP |
|       Get network by code - success       |   NetworksRoutes   |    E2E     | BB/ Boundary - EP |
|        Get network by code - error        |   NetworksRoutes   |    E2E     | BB/ Boundary - EP |
|         Delete network - success          |   NetworksRoutes   |    E2E     | BB/ Boundary - EP |
|          Delete network - error           |   NetworksRoutes   |    E2E     | BB/ Boundary - EP |
|         Update network - success          |   NetworksRoutes   |    E2E     | BB/ Boundary - EP |
|          Update network - error           |   NetworksRoutes   |    E2E     | BB/ Boundary - EP |
|           **Gateways E2E test**           |                    |            |
|        Get all gateways - success         |   GatewaysRoutes   |    E2E     | BB/ Boundary - EP |
|         Get all gateways - error          |   GatewaysRoutes   |    E2E     | BB/ Boundary - EP |
|         Create gateway - success          |   GatewaysRoutes   |    E2E     | BB/ Boundary - EP |
|          Create gateway - error           |   GatewaysRoutes   |    E2E     | BB/ Boundary - EP |
|    Get gateway by macAddress - success    |   GatewaysRoutes   |    E2E     | BB/ Boundary - EP |
|     Get gateway by macAddress - error     |   GatewaysRoutes   |    E2E     | BB/ Boundary - EP |
|         Update gateway - success          |   GatewaysRoutes   |    E2E     | BB/ Boundary - EP |
|          Update gateway - error           |   GatewaysRoutes   |    E2E     | BB/ Boundary - EP |
|         Delete gateway - success          |   GatewaysRoutes   |    E2E     | BB/ Boundary - EP |
|          Delete gateway - error           |   GatewaysRoutes   |    E2E     | BB/ Boundary - EP |
|            **Sensor E2E test**            |                    |            |
|         Get all sensors - success         |    SensorRoutes    |    E2E     | BB/ Boundary - EP |
|          Get all sensors - error          |    SensorRoutes    |    E2E     | BB/ Boundary - EP |
|          Create sensor - success          |    SensorRoutes    |    E2E     | BB/ Boundary - EP |
|           Create sensor - error           |    SensorRoutes    |    E2E     | BB/ Boundary - EP |
|       Get specific sensor - success       |    SensorRoutes    |    E2E     | BB/ Boundary - EP |
|        Get specific sensor - error        |    SensorRoutes    |    E2E     | BB/ Boundary - EP |
|          Delete sensor - success          |    SensorRoutes    |    E2E     | BB/ Boundary - EP |
|           Delete sensor - error           |    SensorRoutes    |    E2E     | BB/ Boundary - EP |
|          Update sensor - success          |    SensorRoutes    |    E2E     | BB/ Boundary - EP |
|           Update sensor - error           |    SensorRoutes    |    E2E     | BB/ Boundary - EP |
=======
<in the table below list the test cases defined For each test report the object tested, the test level (API, integration, unit) and the technique used to define the test case (WB eq partitioning, WB boundary, WB statement coverage, etc)> <split the table if needed>
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
| **Review Controller Integration test** |
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
| **User Routes integration test** | | |
| POST /api/v1/users: Create user: success | UserRoutes | Integration | WB/ Statement Coverage |
| POST /api/v1/users: Create user: 401 UnauthorizedError | UserRoutes | Integration | BB/ Boundary |
| POST /api/v1/users: Create user: 403 InsufficientRightsError | UserRoutes | Integration | BB/ Boundary |
| POST /api/v1/users: Create user: 400 BadRequest (missing fields) | UserRoutes | Integration | BB/ Boundary |
| POST /api/v1/users: Create user: 400 BadRequest (invalid user type) | UserRoutes | Integration | BB/ Equivalence Partitioning |
| POST /api/v1/users: Create user: 409 ConflictError | UserRoutes | Integration | BB/ Equivalence Partitioning |
| POST /api/v1/users: Create user: 400 BadRequest (invalid JSON) | UserRoutes | Integration | BB/ Boundary |
| GET /api/v1/users: Get All Users: success | UserRoutes | Integration | WB/ Statement Coverage |
| GET /api/v1/users: Get All Users: success (empty array) | UserRoutes | Integration | WB/ Statement Coverage |
| GET /api/v1/users: Get All Users: 401 UnauthorizedError | UserRoutes | Integration | BB/ Boundary |
| GET /api/v1/users: Get All Users: 403 InsufficientRightsError | UserRoutes | Integration | BB/ Boundary |
| GET /api/v1/users: Get All Users: 500 InternalServerError | UserRoutes | Integration | WB/ Boundary |
| GET /api/v1/users/:username: Get User By Username: success | UserRoutes | Integration | WB/ Statement Coverage |
| GET /api/v1/users/:username: Get User By Username: 401 UnauthorizedError | UserRoutes | Integration | BB/ Boundary |
| GET /api/v1/users/:username: Get User By Username: 403 InsufficientRightsError | UserRoutes | Integration | BB/ Boundary |
| GET /api/v1/users/:username: Get User By Username: 404 NotFoundError | UserRoutes | Integration | BB/ Boundary |
| GET /api/v1/users/:username: Get User By Username: username con caratteri speciali | UserRoutes | Integration | BB/ Equivalence Partitioning |
| DELETE /api/v1/users/:username: Delete User: success | UserRoutes | Integration | WB/ Statement Coverage |
| DELETE /api/v1/users/:username: Delete User: 401 UnauthorizedError | UserRoutes | Integration | BB/ Boundary |
| DELETE /api/v1/users/:username: Delete User: 403 InsufficientRightsError | UserRoutes | Integration | BB/ Boundary |
| DELETE /api/v1/users/:username: Delete User: 404 NotFoundError | UserRoutes | Integration | BB/ Boundary |
| DELETE /api/v1/users/:username: Delete User: username con caratteri speciali | UserRoutes | Integration | BB/ Equivalence Partitioning |
| GET /api/v1/users/:username: Username molto lunghi | UserRoutes | Integration | BB/ Boundary |
| GET /api/v1/users/:username: URL encoded characters in username | UserRoutes | Integration | BB/ Equivalence Partitioning |
| **Measurement Routes integration test** | | |
| GET /api/v1/networks/:networkCode/measurements: success | MeasurementRoutes | Integration | WB/ Statement Coverage |
| GET /api/v1/networks/:networkCode/measurements: success (with date range filter) | MeasurementRoutes | Integration | BB/ Boundary |
| GET /api/v1/networks/:networkCode/measurements: success (with sensorMacs filter) | MeasurementRoutes | Integration | BB/ Equivalence Partitioning |
| GET /api/v1/networks/:networkCode/measurements: 400 Invalid input data | MeasurementRoutes | Integration | BB/ Boundary |
| GET /api/v1/networks/:networkCode/measurements: 401 UnauthorizedError | MeasurementRoutes | Integration | BB/ Boundary |
| GET /api/v1/networks/:networkCode/measurements: 404 Not Found | MeasurementRoutes | Integration | BB/ Boundary |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac/measurements: success | MeasurementRoutes | Integration | WB/ Statement Coverage |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac/measurements: 401 UnauthorizedError | MeasurementRoutes | Integration | BB/ Boundary |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac/measurements: 404 Not Found | MeasurementRoutes | Integration | BB/ Boundary |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac/measurements: 400 Invalid date format | MeasurementRoutes | Integration | BB/ Boundary |
| GET /api/v1/networks/:networkCode/stats: success | MeasurementRoutes | Integration | WB/ Statement Coverage |
| GET /api/v1/networks/:networkCode/stats: success (with date range filter) | MeasurementRoutes | Integration | BB/ Boundary |
| GET /api/v1/networks/:networkCode/stats: success (with sensorMacs filter) | MeasurementRoutes | Integration | BB/ Equivalence Partitioning |
| GET /api/v1/networks/:networkCode/stats: 401 UnauthorizedError | MeasurementRoutes | Integration | BB/ Boundary |
| GET /api/v1/networks/:networkCode/stats: 404 Not Found | MeasurementRoutes | Integration | BB/ Boundary |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac/stats: success | MeasurementRoutes | Integration | WB/ Statement Coverage |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac/stats: success (with date range filter) | MeasurementRoutes | Integration | BB/ Boundary |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac/stats: 401 UnauthorizedError | MeasurementRoutes | Integration | BB/ Boundary |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac/stats: 404 Not Found | MeasurementRoutes | Integration | BB/ Boundary |
| GET /api/v1/networks/:networkCode/outliers: success | MeasurementRoutes | Integration | WB/ Statement Coverage |
| GET /api/v1/networks/:networkCode/outliers: success (with date range filter) | MeasurementRoutes | Integration | BB/ Boundary |
| GET /api/v1/networks/:networkCode/outliers: success (with sensorMacs filter) | MeasurementRoutes | Integration | BB/ Equivalence Partitioning |
| GET /api/v1/networks/:networkCode/outliers: 401 UnauthorizedError | MeasurementRoutes | Integration | BB/ Boundary |
| GET /api/v1/networks/:networkCode/outliers: 404 Not Found | MeasurementRoutes | Integration | BB/ Boundary |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac/outliers: success | MeasurementRoutes | Integration | WB/ Statement Coverage |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac/outliers: success (with date range filter) | MeasurementRoutes | Integration | BB/ Boundary |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac/outliers: 401 UnauthorizedError | MeasurementRoutes | Integration | BB/ Boundary |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac/outliers: 404 Not Found | MeasurementRoutes | Integration | BB/ Boundary |
| POST /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac/measurements: success | MeasurementRoutes | Integration | WB/ Statement Coverage |
| POST /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac/measurements: success (multiple measurements) | MeasurementRoutes | Integration | WB/ Statement Coverage |
| POST /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac/measurements: 400 Invalid measurement data | MeasurementRoutes | Integration | BB/ Boundary |
| POST /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac/measurements: 400 Invalid date format | MeasurementRoutes | Integration | BB/ Boundary |
| POST /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac/measurements: 401 UnauthorizedError | MeasurementRoutes | Integration | BB/ Boundary |
| POST /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac/measurements: 403 InsufficientRightsError | MeasurementRoutes | Integration | BB/ Boundary |
| POST /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac/measurements: 404 Not Found | MeasurementRoutes | Integration | BB/ Boundary |
| **Network Routes integration test** | | |
| POST /api/v1/networks: Create network: ok | NetworkRoutes | Integration | WB/ Statement Coverage |
| POST /api/v1/networks: Create network: ok, solo campi obbligatori | NetworkRoutes | Integration | WB/ Statement Coverage |
| POST /api/v1/networks: Create network: 401 UnauthorizedError | NetworkRoutes | Integration | BB/ Boundary |
| POST /api/v1/networks: Create network: 403 InsufficientRightsError | NetworkRoutes | Integration | BB/ Boundary |
| POST /api/v1/networks: Create network: 409 Network code already in use | NetworkRoutes | Integration | BB/ Equivalence Partitioning |
| GET /api/v1/networks: Get all networks: ok | NetworkRoutes | Integration | WB/ Statement Coverage |
| GET /api/v1/networks: Get all networks: 401 UnauthorizedError | NetworkRoutes | Integration | BB/ Boundary |
| GET /api/v1/networks: Get all networks: AppError generico | NetworkRoutes | Integration | WB/ Boundary |
| GET /api/v1/networks/:code: Get network by code: ok | NetworkRoutes | Integration | WB/ Statement Coverage |
| GET /api/v1/networks/:code: Get network by code: 401 UnauthorizedError | NetworkRoutes | Integration | BB/ Boundary |
| GET /api/v1/networks/:code: Get network by code: 404 Network not found | NetworkRoutes | Integration | BB/ Boundary |
| PATCH /api/v1/networks/:code: Update network: ok | NetworkRoutes | Integration | WB/ Statement Coverage |
| PATCH /api/v1/networks/:code: Update network: ok, cambio solo opzionali | NetworkRoutes | Integration | WB/ Statement Coverage |
| PATCH /api/v1/networks/:code: Update network: 401 UnauthorizedError | NetworkRoutes | Integration | BB/ Boundary |
| PATCH /api/v1/networks/:code: Update network: 403 InsufficientRightsError | NetworkRoutes | Integration | BB/ Boundary |
| PATCH /api/v1/networks/:code: Update network: 404 Network not found | NetworkRoutes | Integration | BB/ Boundary |
| PATCH /api/v1/networks/:code: Update network: 409 Network code already in use | NetworkRoutes | Integration | BB/ Equivalence Partitioning |
| DELETE /api/v1/networks/:code: Delete network: ok | NetworkRoutes | Integration | WB/ Statement Coverage |
| DELETE /api/v1/networks/:code: Delete network: 401 UnauthorizedError | NetworkRoutes | Integration | BB/ Boundary |
| DELETE /api/v1/networks/:code: Delete network: 403 InsufficientRightsError | NetworkRoutes | Integration | BB/ Boundary |
| DELETE /api/v1/networks/:code: Delete network: 404 Network not found | NetworkRoutes | Integration | BB/ Boundary |
| **Gateway Routes integration test** | | |
| POST /api/v1/networks/:networkCode/gateways: Create Gateway: success (Admin user) | GatewayRoutes | Integration | WB/ Statement Coverage |
| POST /api/v1/networks/:networkCode/gateways: Create Gateway: success (Operator user) | GatewayRoutes | Integration | WB/ Statement Coverage |
| POST /api/v1/networks/:networkCode/gateways: Create Gateway: 401 UnauthorizedError | GatewayRoutes | Integration | BB/ Boundary |
| POST /api/v1/networks/:networkCode/gateways: Create Gateway: 403 InsufficientRightsError | GatewayRoutes | Integration | BB/ Boundary |
| POST /api/v1/networks/:networkCode/gateways: Create Gateway: 404 NotFoundError (network inesistente) | GatewayRoutes | Integration | BB/ Boundary |
| POST /api/v1/networks/:networkCode/gateways: Create Gateway: 409 ConflictError (macAddress già in uso) | GatewayRoutes | Integration | BB/ Equivalence Partitioning |
| GET /api/v1/networks/:networkCode/gateways: Get All Gateways: success (user autenticato) | GatewayRoutes | Integration | WB/ Statement Coverage |
| GET /api/v1/networks/:networkCode/gateways: Get All Gateways: 401 UnauthorizedError | GatewayRoutes | Integration | BB/ Boundary |
| GET /api/v1/networks/:networkCode/gateways: Get All Gateways: 404 NotFoundError | GatewayRoutes | Integration | BB/ Boundary |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac: Get Gateway By MacAddress: success (user autenticato) | GatewayRoutes | Integration | WB/ Statement Coverage |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac: Get Gateway By MacAddress: 401 UnauthorizedError | GatewayRoutes | Integration | BB/ Boundary |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac: Get Gateway By MacAddress: 404 NotFoundError (network inesistente) | GatewayRoutes | Integration | BB/ Boundary |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac: Get Gateway By MacAddress: 404 NotFoundError (macAddress inesistente) | GatewayRoutes | Integration | BB/ Boundary |
| PATCH /api/v1/networks/:networkCode/gateways/:gatewayMac: Update Gateway: success (Admin user) | GatewayRoutes | Integration | WB/ Statement Coverage |
| PATCH /api/v1/networks/:networkCode/gateways/:gatewayMac: Update Gateway: success (Operator user) | GatewayRoutes | Integration | WB/ Statement Coverage |
| PATCH /api/v1/networks/:networkCode/gateways/:gatewayMac: Update Gateway: 401 UnauthorizedError | GatewayRoutes | Integration | BB/ Boundary |
| PATCH /api/v1/networks/:networkCode/gateways/:gatewayMac: Update Gateway: 403 InsufficientRightsError | GatewayRoutes | Integration | BB/ Boundary |
| PATCH /api/v1/networks/:networkCode/gateways/:gatewayMac: Update Gateway: 404 NotFoundError (network inesistente) | GatewayRoutes | Integration | BB/ Boundary |
| PATCH /api/v1/networks/:networkCode/gateways/:gatewayMac: Update Gateway: 404 NotFoundError (macAddress inesistente) | GatewayRoutes | Integration | BB/ Boundary |
| PATCH /api/v1/networks/:networkCode/gateways/:gatewayMac: Update Gateway: 409 ConflictError (macAddress già in uso) | GatewayRoutes | Integration | BB/ Equivalence Partitioning |
| DELETE /api/v1/networks/:networkCode/gateways/:gatewayMac: Delete Gateway: success (Admin user) | GatewayRoutes | Integration | WB/ Statement Coverage |
| DELETE /api/v1/networks/:networkCode/gateways/:gatewayMac: Delete Gateway: success (Operator user) | GatewayRoutes | Integration | WB/ Statement Coverage |
| DELETE /api/v1/networks/:networkCode/gateways/:gatewayMac: Delete Gateway: 401 UnauthorizedError | GatewayRoutes | Integration | BB/ Boundary |
| DELETE /api/v1/networks/:networkCode/gateways/:gatewayMac: Delete Gateway: 403 InsufficientRightsError | GatewayRoutes | Integration | BB/ Boundary |
| DELETE /api/v1/networks/:networkCode/gateways/:gatewayMac: Delete Gateway: 404 NotFoundError (network inesistente) | GatewayRoutes | Integration | BB/ Boundary |
| DELETE /api/v1/networks/:networkCode/gateways/:gatewayMac: Delete Gateway: 404 NotFoundError (macAddress inesistente) | GatewayRoutes | Integration | BB/ Boundary |
| **Sensor Routes integration test** | | |
| POST /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors: Create Sensor: success (Admin user) | SensorRoutes | Integration | WB/ Statement Coverage |
| POST /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors: Create Sensor: success (Operator user) | SensorRoutes | Integration | WB/ Statement Coverage |
| POST /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors: Create Sensor: 401 UnauthorizedError | SensorRoutes | Integration | BB/ Boundary |
| POST /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors: Create Sensor: 403 InsufficientRightsError | SensorRoutes | Integration | BB/ Boundary |
| POST /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors: Create Sensor: 404 NotFoundError (network inesistente) | SensorRoutes | Integration | BB/ Boundary |
| POST /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors: Create Sensor: 404 NotFoundError (gateway inesistente) | SensorRoutes | Integration | BB/ Boundary |
| POST /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors: Create Sensor: 409 ConflictError (macAddress già in uso) | SensorRoutes | Integration | BB/ Equivalence Partitioning |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors: Get All Sensors: success (authenticated user) | SensorRoutes | Integration | WB/ Statement Coverage |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors: Get All Sensors: 401 UnauthorizedError | SensorRoutes | Integration | BB/ Boundary |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors: Get All Sensors: 404 NotFoundError (network inesistente) | SensorRoutes | Integration | BB/ Boundary |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors: Get All Sensors: 404 NotFoundError (gateway inesistente) | SensorRoutes | Integration | BB/ Boundary |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac: Get Sensor: success | SensorRoutes | Integration | WB/ Statement Coverage |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac: Get Sensor: 401 UnauthorizedError | SensorRoutes | Integration | BB/ Boundary |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac: Get Sensor: 404 NotFoundError (sensor inesistente) | SensorRoutes | Integration | BB/ Boundary |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac: Get Sensor: 404 NotFoundError (gateway inesistente) | SensorRoutes | Integration | BB/ Boundary |
| DELETE /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac: Delete Sensor: success (Admin user) | SensorRoutes | Integration | WB/ Statement Coverage |
| DELETE /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac: Delete Sensor: success (Operator user) | SensorRoutes | Integration | WB/ Statement Coverage |
| DELETE /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac: Delete Sensor: 401 UnauthorizedError | SensorRoutes | Integration | BB/ Boundary |
| DELETE /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac: Delete Sensor: 403 InsufficientRightsError | SensorRoutes | Integration | BB/ Boundary |
| DELETE /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac: Delete Sensor: 404 NotFoundError (network inesistente) | SensorRoutes | Integration | BB/ Boundary |
| DELETE /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac: Delete Sensor: 404 NotFoundError (gateway inesistente) | SensorRoutes | Integration | BB/ Boundary |
| DELETE /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac: Delete Sensor: 404 NotFoundError (sensor inesistente) | SensorRoutes | Integration | BB/ Boundary |
| PATCH /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac: Update Sensor: success (Admin user) | SensorRoutes | Integration | WB/ Statement Coverage |
| PATCH /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac: Update Sensor: success (Operator user) | SensorRoutes | Integration | WB/ Statement Coverage |
| PATCH /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac: Update Sensor: 401 UnauthorizedError | SensorRoutes | Integration | BB/ Boundary |
| PATCH /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac: Update Sensor: 403 InsufficientRightsError | SensorRoutes | Integration | BB/ Boundary |
| PATCH /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac: Update Sensor: 404 NotFoundError (network inesistente) | SensorRoutes | Integration | BB/ Boundary |
| PATCH /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac: Update Sensor: 404 NotFoundError (gateway inesistente) | SensorRoutes | Integration | BB/ Boundary |
| PATCH /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac: Update Sensor: 404 NotFoundError (sensor inesistente) | SensorRoutes | Integration | BB/ Boundary |
| PATCH /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac: Update Sensor: 409 ConflictError (macAddress già in uso) | SensorRoutes | Integration | BB/ Equivalence Partitioning |
| **Authentication Routes integration test** | | |
| POST /api/v1/auth: Authenticate: ok | AuthenticationRoutes | Integration | WB/ Statement Coverage |
| POST /api/v1/auth: Authenticate: 401 UnauthorizedError | AuthenticationRoutes | Integration | BB/ Boundary |
| POST /api/v1/auth: Authenticate: 404 UserNotFound | AuthenticationRoutes | Integration | BB/ Boundary |
| POST /api/v1/auth: Authenticate: Invalid token format | AuthenticationRoutes | Integration | BB/ Equivalence Partitioning |
| POST /api/v1/auth: Authenticate: Missing username or password | AuthenticationRoutes | Integration | BB/ Boundary |
| POST /api/v1/auth: Authenticate: Invalid JSON format | AuthenticationRoutes | Integration | BB/ Boundary |
| POST /api/v1/auth: Authenticate: User with special characters in username | AuthenticationRoutes | Integration | BB/ Equivalence Partitioning |
| POST /api/v1/auth: Authenticate: User with long username | AuthenticationRoutes | Integration | BB/ Boundary |
| POST /api/v1/auth: Authenticate: User with unsupported UserType | AuthenticationRoutes | Integration | BB/ Equivalence Partitioning |
| **Review e2e test** | | |
| **Users E2E test** | | |
| GET /api/v1/users: Get All Users: success (admin user) | UsersRoutes | E2E | WB/ Statement Coverage |
| GET /api/v1/users: Get All Users: 403 InsufficientRightsError (operator user) | UsersRoutes | E2E | BB/ Boundary |
| GET /api/v1/users: Get All Users: 403 InsufficientRightsError (viewer user) | UsersRoutes | E2E | BB/ Boundary |
| GET /api/v1/users: Get All Users: 401 UnauthorizedError (token non presente) | UsersRoutes | E2E | BB/ Boundary |
| GET /api/v1/users: Get All Users: 401 UnauthorizedError (token non valido) | UsersRoutes | E2E | BB/ Boundary |
| GET /api/v1/users: Get All Users: 401 UnauthorizedError (token formato invalido) | UsersRoutes | E2E | BB/ Boundary |
| POST /api/v1/users: Create user: success (admin user) | UsersRoutes | E2E | WB/ Statement Coverage |
| POST /api/v1/users: Create user: 403 InsufficientRightsError (operator user) | UsersRoutes | E2E | BB/ Boundary |
| POST /api/v1/users: Create user: 403 InsufficientRightsError (viewer user) | UsersRoutes | E2E | BB/ Boundary |
| POST /api/v1/users: Create user: 401 UnauthorizedError (token non presente) | UsersRoutes | E2E | BB/ Boundary |
| POST /api/v1/users: Create user: 409 ConflictError (username già esistente) | UsersRoutes | E2E | BB/ Equivalence Partitioning |
| POST /api/v1/users: Create user: 400 BadRequest (username mancante) | UsersRoutes | E2E | BB/ Boundary |
| POST /api/v1/users: Create user: 400 BadRequest (password mancante) | UsersRoutes | E2E | BB/ Boundary |
| POST /api/v1/users: Create user: 400 BadRequest (type user mancante) | UsersRoutes | E2E | BB/ Boundary |
| POST /api/v1/users: Create user: 400 BadRequest (user type non valido) | UsersRoutes | E2E | BB/ Equivalence Partitioning |
| POST /api/v1/users: Create user: success (crea user di tipo admin) | UsersRoutes | E2E | WB/ Statement Coverage |
| POST /api/v1/users: Create user: success (crea user di tipo operator) | UsersRoutes | E2E | WB/ Statement Coverage |
| GET /api/v1/users/{userName}: Get User: success (admin user) | UsersRoutes | E2E | WB/ Statement Coverage |
| GET /api/v1/users/{userName}: Get User: success (operator user) | UsersRoutes | E2E | WB/ Statement Coverage |
| GET /api/v1/users/{userName}: Get User: success (viewer user) | UsersRoutes | E2E | WB/ Statement Coverage |
| GET /api/v1/users/{userName}: Get User: 404 NotFoundError (user inesistente) | UsersRoutes | E2E | BB/ Boundary |
| GET /api/v1/users/{userName}: Get User: 403 InsufficientRightsError (operator user) | UsersRoutes | E2E | BB/ Boundary |
| GET /api/v1/users/{userName}: Get User: 403 InsufficientRightsError (viewer user) | UsersRoutes | E2E | BB/ Boundary |
| GET /api/v1/users/{userName}: Get User: 401 UnauthorizedError (token assente) | UsersRoutes | E2E | BB/ Boundary |
| GET /api/v1/users/{userName}: Get User: 401 UnauthorizedError (token non valido) | UsersRoutes | E2E | BB/ Boundary |
| DELETE /api/v1/users/{userName}: Delete user: success | UsersRoutes | E2E | WB/ Statement Coverage |
| DELETE /api/v1/users/{userName}: Delete user: 404 NotFoundError (user inesistente) | UsersRoutes | E2E | BB/ Boundary |
| DELETE /api/v1/users/{userName}: Delete user: 403 InsufficientRightsError (operator user) | UsersRoutes | E2E | BB/ Boundary |
| DELETE /api/v1/users/{userName}: Delete user: 403 InsufficientRightsError (viewer user) | UsersRoutes | E2E | BB/ Boundary |
| DELETE /api/v1/users/{userName}: Delete user: 401 UnauthorizedError (token non presente) | UsersRoutes | E2E | BB/ Boundary |
| DELETE /api/v1/users/{userName}: Delete user: 401 UnauthorizedError (token non valido) | UsersRoutes | E2E | BB/ Boundary |
| DELETE /api/v1/users/{userName}: Delete user: success (admin elimina admin) | UsersRoutes | E2E | WB/ Statement Coverage |
| DELETE /api/v1/users/{userName}: Delete user: success (admin elimina operator) | UsersRoutes | E2E | WB/ Statement Coverage |
| Authentication: 401 UnauthorizedError: authorization header vuoto | UsersRoutes | E2E | BB/ Boundary |
| Authentication: 401 UnauthorizedError: bearer token vuoto | UsersRoutes | E2E | BB/ Boundary |
| Authentication: 401 UnauthorizedError: formato del token sbagliato | UsersRoutes | E2E | BB/ Boundary |
| Authentication: 401 UnauthorizedError: Token malformato | UsersRoutes | E2E | BB/ Boundary |
| Gestione user lifecycle completo (create, get, delete) | UsersRoutes | E2E | WB/ Statement Coverage |
| Gestione di creazioni e cancellazioni multiple di user | UsersRoutes | E2E | WB/ Statement Coverage |
| **Measurements E2E test** | | |
| GET /api/v1/networks/:networkCode/measurements: Get all measurements: success | MeasurementsRoutes | E2E | WB/ Statement Coverage |
| GET /api/v1/networks/:networkCode/measurements: Get all measurements with date range filter | MeasurementsRoutes | E2E | BB/ Boundary |
| GET /api/v1/networks/:networkCode/measurements: Get measurements with specific sensor filter | MeasurementsRoutes | E2E | BB/ Equivalence Partitioning |
| GET /api/v1/networks/:networkCode/measurements: Get measurements with unauthorized token | MeasurementsRoutes | E2E | BB/ Boundary |
| GET /api/v1/networks/:networkCode/measurements: Get measurements for non-existent network | MeasurementsRoutes | E2E | BB/ Boundary |
| GET /api/v1/networks/:networkCode/measurements: Get measurements with viewer token | MeasurementsRoutes | E2E | WB/ Statement Coverage |
| POST /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac/measurements: Create measurements with operator token | MeasurementsRoutes | E2E | WB/ Statement Coverage |
| POST /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac/measurements: Create measurements with viewer token should fail | MeasurementsRoutes | E2E | BB/ Boundary |
| POST /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac/measurements: Create measurement with invalid data format | MeasurementsRoutes | E2E | BB/ Boundary |
| POST /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac/measurements: Create measurement with missing required field | MeasurementsRoutes | E2E | BB/ Boundary |
| POST /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac/measurements: Create measurement for non-existent sensor | MeasurementsRoutes | E2E | BB/ Boundary |
| GET /api/v1/networks/:networkCode/stats: Get stats for all sensors | MeasurementsRoutes | E2E | WB/ Statement Coverage |
| GET /api/v1/networks/:networkCode/stats: Get stats with date range | MeasurementsRoutes | E2E | BB/ Boundary |
| GET /api/v1/networks/:networkCode/outliers: Get outliers for all sensors | MeasurementsRoutes | E2E | WB/ Statement Coverage |
| GET /api/v1/networks/:networkCode/outliers: Get outliers with date filter | MeasurementsRoutes | E2E | BB/ Boundary |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac/measurements: Get measurements for specific sensor | MeasurementsRoutes | E2E | WB/ Statement Coverage |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac/measurements: Get measurements for specific sensor with date range | MeasurementsRoutes | E2E | BB/ Boundary |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac/measurements: Get measurements for non-existent sensor | MeasurementsRoutes | E2E | BB/ Boundary |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac/measurements: Get measurements with invalid date format | MeasurementsRoutes | E2E | BB/ Boundary |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac/stats: Get stats for specific sensor | MeasurementsRoutes | E2E | WB/ Statement Coverage |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac/stats: Get stats with date range | MeasurementsRoutes | E2E | BB/ Boundary |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac/outliers: Get outliers for specific sensor | MeasurementsRoutes | E2E | WB/ Statement Coverage |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac/outliers: Get outliers with date filter | MeasurementsRoutes | E2E | BB/ Boundary |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac/outliers: Get outliers for non-existent sensor | MeasurementsRoutes | E2E | BB/ Boundary |
| **Networks E2E test** | | |
| GET /api/v1/networks: Get all networks: success (admin user, empty array) | NetworksRoutes | E2E | WB/ Statement Coverage |
| GET /api/v1/networks: Get all networks: success (operator user, empty array) | NetworksRoutes | E2E | WB/ Statement Coverage |
| GET /api/v1/networks: Get all networks: success (viewer user, empty array) | NetworksRoutes | E2E | WB/ Statement Coverage |
| GET /api/v1/networks: Get all networks: success (admin user, with entries) | NetworksRoutes | E2E | WB/ Statement Coverage |
| GET /api/v1/networks: Get all networks: success (operator user, with entries) | NetworksRoutes | E2E | WB/ Statement Coverage |
| GET /api/v1/networks: Get all networks: success (viewer user, with entries) | NetworksRoutes | E2E | WB/ Statement Coverage |
| GET /api/v1/networks: Get all networks: 401 UnauthorizedError (token non presente) | NetworksRoutes | E2E | BB/ Boundary |
| POST /api/v1/networks: Create network: success (admin user, all fields) | NetworksRoutes | E2E | WB/ Statement Coverage |
| POST /api/v1/networks: Create network: success (admin user, required fields only) | NetworksRoutes | E2E | WB/ Statement Coverage |
| POST /api/v1/networks: Create network: success (operator user, all fields) | NetworksRoutes | E2E | WB/ Statement Coverage |
| POST /api/v1/networks: Create network: success (operator user, required fields only) | NetworksRoutes | E2E | WB/ Statement Coverage |
| POST /api/v1/networks: Create network: 400 Invalid input data (missing networkCode) | NetworksRoutes | E2E | BB/ Boundary |
| POST /api/v1/networks: Create network: 401 UnauthorizedError (invalid token format) | NetworksRoutes | E2E | BB/ Boundary |
| POST /api/v1/networks: Create network: 403 InsufficientRightsError (viewer user) | NetworksRoutes | E2E | BB/ Boundary |
| POST /api/v1/networks: Create network: 409 ConflictError (network code already in use) | NetworksRoutes | E2E | BB/ Equivalence Partitioning |
| GET /api/v1/networks/:networkCode: Get network by code: success (admin user) | NetworksRoutes | E2E | WB/ Statement Coverage |
| GET /api/v1/networks/:networkCode: Get network by code: success (operator user) | NetworksRoutes | E2E | WB/ Statement Coverage |
| GET /api/v1/networks/:networkCode: Get network by code: success (viewer user) | NetworksRoutes | E2E | WB/ Statement Coverage |
| GET /api/v1/networks/:networkCode: Get network by code: 401 UnauthorizedError (invalid token format) | NetworksRoutes | E2E | BB/ Boundary |
| GET /api/v1/networks/:networkCode: Get network by code: 404 NotFoundError (network inesistente) | NetworksRoutes | E2E | BB/ Boundary |
| DELETE /api/v1/networks/:networkCode: Delete network: success (admin user) | NetworksRoutes | E2E | WB/ Statement Coverage |
| DELETE /api/v1/networks/:networkCode: Delete network: success (operator user) | NetworksRoutes | E2E | WB/ Statement Coverage |
| DELETE /api/v1/networks/:networkCode: Delete network: 401 UnauthorizedError (token non presente) | NetworksRoutes | E2E | BB/ Boundary |
| DELETE /api/v1/networks/:networkCode: Delete network: 403 InsufficientRightsError (viewer user) | NetworksRoutes | E2E | BB/ Boundary |
| DELETE /api/v1/networks/:networkCode: Delete network: 404 NotFoundError (network inesistente) | NetworksRoutes | E2E | BB/ Boundary |
| PATCH /api/v1/networks/:networkCode: Update network: success (admin user, all fields updated) | NetworksRoutes | E2E | WB/ Statement Coverage |
| PATCH /api/v1/networks/:networkCode: Update network: success (operator user, code unchanged) | NetworksRoutes | E2E | WB/ Statement Coverage |
| PATCH /api/v1/networks/:networkCode: Update network: 401 UnauthorizedError (invalid token format) | NetworksRoutes | E2E | BB/ Boundary |
| PATCH /api/v1/networks/:networkCode: Update network: 403 InsufficientRightsError (viewer user) | NetworksRoutes | E2E | BB/ Boundary |
| PATCH /api/v1/networks/:networkCode: Update network: 404 NotFoundError (network inesistente) | NetworksRoutes | E2E | BB/ Boundary |
| PATCH /api/v1/networks/:networkCode: Update network: 409 ConflictError (network code already in use) | NetworksRoutes | E2E | BB/ Equivalence Partitioning |
| **Gateways E2E test** | | |
| GET /api/v1/networks/:networkCode/gateways: Get all gateways: success (admin user, empty array) | GatewaysRoutes | E2E | WB/ Statement Coverage |
| GET /api/v1/networks/:networkCode/gateways: Get all gateways: success (operator user, empty array) | GatewaysRoutes | E2E | WB/ Statement Coverage |
| GET /api/v1/networks/:networkCode/gateways: Get all gateways: success (viewer user, empty array) | GatewaysRoutes | E2E | WB/ Statement Coverage |
| GET /api/v1/networks/:networkCode/gateways: Get all gateways: success (admin user, with entries) | GatewaysRoutes | E2E | WB/ Statement Coverage |
| GET /api/v1/networks/:networkCode/gateways: Get all gateways: success (operator user, with entries) | GatewaysRoutes | E2E | WB/ Statement Coverage |
| GET /api/v1/networks/:networkCode/gateways: Get all gateways: success (viewer user, with entries) | GatewaysRoutes | E2E | WB/ Statement Coverage |
| GET /api/v1/networks/:networkCode/gateways: Get all gateways: 401 UnauthorizedError (token non presente) | GatewaysRoutes | E2E | BB/ Boundary |
| GET /api/v1/networks/:networkCode/gateways: Get all gateways: 401 UnauthorizedError (token non valido) | GatewaysRoutes | E2E | BB/ Boundary |
| GET /api/v1/networks/:networkCode/gateways: Get all gateways: 401 UnauthorizedError (formato del token non valido) | GatewaysRoutes | E2E | BB/ Boundary |
| GET /api/v1/networks/:networkCode/gateways: Get all gateways: 404 NotFoundError (network inesistente) | GatewaysRoutes | E2E | BB/ Boundary |
| POST /api/v1/networks/:networkCode/gateways: Create gateway: success (admin user, all fields) | GatewaysRoutes | E2E | WB/ Statement Coverage |
| POST /api/v1/networks/:networkCode/gateways: Create gateway: success (operator user, required fields only) | GatewaysRoutes | E2E | WB/ Statement Coverage |
| POST /api/v1/networks/:networkCode/gateways: Create gateway: success (admin user, ignoring nested sensors) | GatewaysRoutes | E2E | WB/ Statement Coverage |
| POST /api/v1/networks/:networkCode/gateways: Create gateway: 400 Invalid input data (missing macAddress) | GatewaysRoutes | E2E | BB/ Boundary |
| POST /api/v1/networks/:networkCode/gateways: Create gateway: 400 Invalid input data (empty macAddress) | GatewaysRoutes | E2E | BB/ Boundary |
| POST /api/v1/networks/:networkCode/gateways: Create gateway: 401 UnauthorizedError (token non presente) | GatewaysRoutes | E2E | BB/ Boundary |
| POST /api/v1/networks/:networkCode/gateways: Create gateway: 403 InsufficientRightsError (viewer user) | GatewaysRoutes | E2E | BB/ Boundary |
| POST /api/v1/networks/:networkCode/gateways: Create gateway: 404 NotFoundError (network inesistente) | GatewaysRoutes | E2E | BB/ Boundary |
| POST /api/v1/networks/:networkCode/gateways: Create gateway: 409 ConflictError (macAddress già in uso) | GatewaysRoutes | E2E | BB/ Equivalence Partitioning |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac: Get gateway by macAddress: success (admin user) | GatewaysRoutes | E2E | WB/ Statement Coverage |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac: Get gateway by macAddress: success (operator user) | GatewaysRoutes | E2E | WB/ Statement Coverage |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac: Get gateway by macAddress: success (viewer user) | GatewaysRoutes | E2E | WB/ Statement Coverage |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac: Get gateway by macAddress: 401 UnauthorizedError (token non presente) | GatewaysRoutes | E2E | BB/ Boundary |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac: Get gateway by macAddress: 404 NotFoundError (network inesistente) | GatewaysRoutes | E2E | BB/ Boundary |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac: Get gateway by macAddress: 404 NotFoundError (gateway inesistente) | GatewaysRoutes | E2E | BB/ Boundary |
| PATCH /api/v1/networks/:networkCode/gateways/:gatewayMac: Update gateway: success (admin user, update name and description) | GatewaysRoutes | E2E | WB/ Statement Coverage |
| PATCH /api/v1/networks/:networkCode/gateways/:gatewayMac: Update gateway: success (operator user, update macAddress) | GatewaysRoutes | E2E | WB/ Statement Coverage |
| PATCH /api/v1/networks/:networkCode/gateways/:gatewayMac: Update gateway: success (admin user, ignoring nested sensors) | GatewaysRoutes | E2E | WB/ Statement Coverage |
| PATCH /api/v1/networks/:networkCode/gateways/:gatewayMac: Update gateway: 401 UnauthorizedError (token non presente) | GatewaysRoutes | E2E | BB/ Boundary |
| PATCH /api/v1/networks/:networkCode/gateways/:gatewayMac: Update gateway: 403 InsufficientRightsError (viewer user) | GatewaysRoutes | E2E | BB/ Boundary |
| PATCH /api/v1/networks/:networkCode/gateways/:gatewayMac: Update gateway: 404 NotFoundError (network inesistente) | GatewaysRoutes | E2E | BB/ Boundary |
| PATCH /api/v1/networks/:networkCode/gateways/:gatewayMac: Update gateway: 404 NotFoundError (gateway inesistente) | GatewaysRoutes | E2E | BB/ Boundary |
| PATCH /api/v1/networks/:networkCode/gateways/:gatewayMac: Update gateway: 409 ConflictError (macAddress già in uso) | GatewaysRoutes | E2E | BB/ Equivalence Partitioning |
| DELETE /api/v1/networks/:networkCode/gateways/:gatewayMac: Delete gateway: success (admin user) | GatewaysRoutes | E2E | WB/ Statement Coverage |
| DELETE /api/v1/networks/:networkCode/gateways/:gatewayMac: Delete gateway: success (operator user) | GatewaysRoutes | E2E | WB/ Statement Coverage |
| DELETE /api/v1/networks/:networkCode/gateways/:gatewayMac: Delete gateway: 401 UnauthorizedError (token non presente) | GatewaysRoutes | E2E | BB/ Boundary |
| DELETE /api/v1/networks/:networkCode/gateways/:gatewayMac: Delete gateway: 403 InsufficientRightsError (viewer user) | GatewaysRoutes | E2E | BB/ Boundary |
| DELETE /api/v1/networks/:networkCode/gateways/:gatewayMac: Delete gateway: 404 NotFoundError (network inesistente) | GatewaysRoutes | E2E | BB/ Boundary |
| DELETE /api/v1/networks/:networkCode/gateways/:gatewayMac: Delete gateway: 404 NotFoundError (gateway inesistente) | GatewaysRoutes | E2E | BB/ Boundary |
| GET /api/v1/networks/:networkCode/gateways: Get all gateways after CRUD operations: success | GatewaysRoutes | E2E | WB/ Statement Coverage |
| GET /api/v1/networks/:networkCode/gateways: Get gateways with correct structure | GatewaysRoutes | E2E | WB/ Statement Coverage |
| **Sensor E2E test** | | |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors: Get all sensors: success (admin user) | SensorRoutes | E2E | WB/ Statement Coverage |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors: Get all sensors: success (operator user) | SensorRoutes | E2E | WB/ Statement Coverage |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors: Get all sensors: success (viewer user) | SensorRoutes | E2E | WB/ Statement Coverage |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors: Get all sensors: empty array (admin user) | SensorRoutes | E2E | WB/ Statement Coverage |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors: Get all sensors: empty array (operator user) | SensorRoutes | E2E | WB/ Statement Coverage |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors: Get all sensors: empty array (viewer user) | SensorRoutes | E2E | WB/ Statement Coverage |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors: 401 UnauthorizedError (token non presente) | SensorRoutes | E2E | BB/ Boundary |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors: 404 NotFoundError (gateway inesistente) | SensorRoutes | E2E | BB/ Boundary |
| POST /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors: Create sensor: success (admin user, all fields) | SensorRoutes | E2E | WB/ Statement Coverage |
| POST /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors: Create sensor: success (operator user, all fields) | SensorRoutes | E2E | WB/ Statement Coverage |
| POST /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors: Create sensor: success (admin user, required fields only) | SensorRoutes | E2E | WB/ Statement Coverage |
| POST /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors: Create sensor: success (operator user, required fields only) | SensorRoutes | E2E | WB/ Statement Coverage |
| POST /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors: 400 Invalid input data (missing macAddress) | SensorRoutes | E2E | BB/ Boundary |
| POST /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors: 401 UnauthorizedError (token non presente) | SensorRoutes | E2E | BB/ Boundary |
| POST /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors: 403 InsufficientRightsError (viewer user) | SensorRoutes | E2E | BB/ Boundary |
| POST /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors: 404 NotFoundError (gateway inesistente) | SensorRoutes | E2E | BB/ Boundary |
| POST /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors: 409 ConflictError (macAddress già in uso) | SensorRoutes | E2E | BB/ Equivalence Partitioning |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac: Get specific sensor: success (admin user) | SensorRoutes | E2E | WB/ Statement Coverage |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac: Get specific sensor: success (operator user) | SensorRoutes | E2E | WB/ Statement Coverage |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac: Get specific sensor: success (viewer user) | SensorRoutes | E2E | WB/ Statement Coverage |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac: 401 UnauthorizedError (token non presente) | SensorRoutes | E2E | BB/ Boundary |
| GET /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac: 404 NotFoundError (sensor inesistente) | SensorRoutes | E2E | BB/ Boundary |
| DELETE /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac: Delete sensor: success (admin user) | SensorRoutes | E2E | WB/ Statement Coverage |
| DELETE /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac: 401 UnauthorizedError (token non presente) | SensorRoutes | E2E | BB/ Boundary |
| DELETE /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac: 403 InsufficientRightsError (viewer user) | SensorRoutes | E2E | BB/ Boundary |
| DELETE /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac: 404 NotFoundError (sensor inesistente) | SensorRoutes | E2E | BB/ Boundary |
| PATCH /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac: Update sensor: success (admin user, update name and description) | SensorRoutes | E2E | WB/ Statement Coverage |
| PATCH /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac: Update sensor: success (operator user, update name and description) | SensorRoutes | E2E | WB/ Statement Coverage |
| PATCH /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac: Update sensor: success (admin user, update all fields) | SensorRoutes | E2E | WB/ Statement Coverage |
| PATCH /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac: 401 UnauthorizedError (token non presente) | SensorRoutes | E2E | BB/ Boundary |
| PATCH /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac: 403 InsufficientRightsError (viewer user) | SensorRoutes | E2E | BB/ Boundary |
| PATCH /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac: 404 NotFoundError (sensor inesistente) | SensorRoutes | E2E | BB/ Boundary |
| PATCH /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac: 409 ConflictError (macAddress già in uso) | SensorRoutes | E2E | BB/ Equivalence Partitioning |
>>>>>>> 652db4c590cff8643bcc46617fb7774624166e58

# Coverage

## Coverage of FR

<Report in the following table the coverage of functional requirements and scenarios(from official requirements) >

|                   Functional Requirement or scenario                   | Test(s) |
| :--------------------------------------------------------------------: | :-----: |
|                         **FR1 Authentication**                         |         |
|                        FR1.1 Authenticate user                         |   17    |
|                          **FR2 Manage users**                          |         |
|                        FR2.1 Retrieve all users                        |   29    |
|                        FR2.2 Create a new user                         |   40    |
|                     FR2.3 Retrieve a specific user                     |   36    |
|                      FR2.4 Delete a specific user                      |   30    |
|                        **FR3 Manage networks**                         |         |
|                      FR3.1 Retrieve all networks                       |   20    |
|                       FR3.2 Create a new network                       |   28    |
|                   FR3.3 Retrieve a specific network                    |   12    |
|                         FR3.4 Update a network                         |   29    |
|                    FR3.5 Delete a specific network                     |   15    |
|                        **FR4 Manage gateways**                         |         |
|                FR4.1 Retrieve all gateways of a network                |   25    |
|                FR4.2 Create a new gateway for a network                |   36    |
|                   FR4.3 Retrieve a specific gateway                    |   22    |
|                         FR4.4 Update a gateway                         |   32    |
|                    FR4.5 Delete a specific gateway                     |   21    |
|                         **FR5 Manage sensors**                         |         |
|                FR5.1 Retrieve all sensors of a gateway                 |   18    |
|                FR5.2 Create a new sensor for a gateway                 |   24    |
|                    FR5.3 Retrieve a specific sensor                    |   13    |
|                         FR5.4 Update a sensor                          |   20    |
|                     FR5.5 Delete a specific sensor                     |   22    |
|                      **FR6 Manage measurements**                       |         |
| FR6.1 Retrieve measurements for a set of sensors of a specific network |   34    |
|  FR6.2 Retrieve statistics for a set of sensors of a specific network  |   12    |
|   FR6.3 Retrieve outliers for a set of sensors of a specific network   |   12    |
|             FR6.4 Store measurements for a specific sensor             |   17    |
|           FR6.5 Retrieve measurements for a specific sensor            |   22    |
|            FR6.6 Retrieve statistics for a specific sensor             |   14    |
|             FR6.7 Retrieve outliers for a specific sensor              |   12    |
|                                                                        |   612   |

There are other 5 tests for errorService and utils

## Coverage white box
