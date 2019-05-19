# Devowelizer Test Plan

The scripts are located [here](./testplan).
The tests are organized as:
-	Master test plan is **plan-devowelizer.jmx**,
- Functional test plan is **tf-functional-test.jmx**
- Performance test plan is **tf-performance-test.jmx**

where
- `plan` - is the top level JMeter script
- `tf` - stands for `test fragment` and they are used by top level script. These cannot be run directly.

When running the master test plan, there is an option to run only the functional, performance or both of them.
By default both tests fragments are included. Please check section **Test Execution**

## Prerequisites

- Install [JMeter](https://jmeter.apache.org/download_jmeter.cgi) v5.1.1
- Set **JMETER_HOME** environment variable to the installation folder.
- Enable jmeter plugins by downloading and following the instructions [here](https://jmeter-plugins.org/install/Install/).

### MacOs

- JMeter can be installed with `brew install jmeter`
- The JMeter installation path can be found with `brew info jmeter`

## Test Plans Description

### Master Test plan
*plan-devowelizer.jmx* - It contains the following elements:

#### Server Configuration

- **port**, on which the application is running ( default is `8080`)
- **protocol**, which is used by the application	(default is `http`)
- **host**, the URL to access the application (default is `localhost`)
- **nrthreads**, the number of the concurrent users/threads, that will be used for the performance test fragment ( default is `20`)
- **csvFile**, the csv file, which contains the tests for the functional tests (default is `testInputs.csv`). It needs to be located where the test-plans are ( same directory).
- **loopCount**, the number of the test repetitions for the performance test fragment, (default is `50`)
- **includeFunctionalTests**, if the functional tests are enabled, (default is `true`)
- **includePerformanceTests**, if the performance test fragment is enabled, default is (`true`)
- **performanceLengthString**, the size of the `path` parameter for the performance test fragment. The default is `1`, which triggers a logic to generate random strings with different length.
  Check `Performance Test Plan` section for more details
- **durationResponseTime**, duration assertion, default is `6000` ms. If the request is longer than this value, it will be considered and reported as an error.

#### Test Inputs Data (csv)
The file which contains definitions for the functional tests. It is consisted of :
- **testName**, the name of the functional
- **size**, the size of the string, that will be used as `path`
- **path**, the string that will be passed as `path` to the application
- **expectedResult**, expected response of the application, in order to mark the functional test as successful.

#### Default request configuration
 It defines the values for all http/https requests, based on the input parameters

#### setUp Thread Group "Verify if the server is up and running"
This thread group checks if the server is up and running. If it gets an error, the test execution will be aborted.
It contains the following elements:
- **JSR223 PreProcessor** `Define the number of the functional test cases`, which calculates dynamically the lines number in `testInputs.csv` and export the value for the functional test fragment
- **Response assertion** for exact match, response assertion to verify that the actual result matches the expected result, defined into the csv file.
- **BeanShell Assertion** for test failure and retry logic. Since every fifth request returns `Internal Server Error`, there is a retry logic to resend the request only once.
- It uses the first line of the `csvFile` as an input for the test.

#### Functional API tests
It includes the test fragment for the functional tests, if the parameter includeFunctionalTests is `true`.
It contains:
- **Test Fragment** for `Functional API testing`
- **If controller** `Check if functional tests are enabled for the run`
- **Include controller** `Include Functional Test Fragment`, which runs `tf-functional-test.jmx` test plan.

#### Performance test
It includes the test fragment for the functional tests, if the parameter includePerformanceTests is `true`
It contains:
- **Test Fragment** for `Performance Test`
- **If controller** `Check if performance tests are enabled for the run`
- **Include controller** `Include Functional Test Fragment`, which runs `tf-performance-test.jmx` test plan.
- **Graph result listener** `Graph Results`, which visualize the requests, done via the performance tests (when using GUI mode)
- jp@gc - Response Codes per Second, which shows the response codes of the requests, during the perf run ( when using GUI mode)
- jp@gc - Hits per Second, which shows the hits to the application per second (when using GUI mode)
- jp@gc - Response Times Over Time, which shows the response time of the requests during the performance test execution (when using GUI mode)
- jp@gc - Transactions per Second, which shows the throughput of the system (when using GUI mode)

#### View Results Tree
Shows detailed information for each request, very useful for debugging. By default is disabled, since it causes performance issues to jMeter when running performance test.

#### Summary Report
When tests are executed in **graphical mode** (using jMeter UI), it shows the summary of the requests.

##### Response Assertion for code 200
It verifies that the response code for each request is **200** (OK)

#### Response Duration Assertion
It verifies that response time for each request is no longer than the specified one ( Default is `6000` milliseconds)

### Functional API testing
**tf-functional-test.jmx** It contains the following :
- Http request `Test with ${testName} and stringSize ${size}`, parameters are taken from the csv file.
- JSR223 PreProcessor `Generate large strings`, which can be used to generate large, custom strings. By default it generates string with length 512 and another one with 8075 symbols.
- BeanShell Assertion for test failure and retry logic. Since every fifth request returns `Internal Server Error`, there is a retry logic to resend the request only once.

Current Functional Tests Included ( every line is a new test test). New tests can be added automatically by adding additional lines into the csv file.
```
testName,stringLenght,stringInput,expectedOutput
Only vowels with small letters,5,aeuio,,
Vowels with "y" included,6,aeuioy,y,
Only vowels with small letters,5,aeuio,,
Capital vowels,5,AEUIO,AEUIO,
Only non-vowels,21,bcdfghjklmnpqrstvwxyz,bcdfghjklmnpqrstvwxyz
The whole alphabet lower case,26,abcdefghijklmnopqrstuvwxyz,bcdfghjklmnpqrstvwxyz
The whole alphabet capital letters,26,ABCDEFGHIJKLMNOPQRSTUVWXYZ,ABCDEFGHIJKLMNOPQRSTUVWXYZ
Empty string,0,,Send GET to /:input
Only numbers,10,01234567890,01234567890
LongString,512,definedInTheScript,definedInTheScript
UltraLong String,8075,definedInTheScript,definedInTheScript
```
### Performance Tests
**tf-performance-test.jmx** It contains the following:
- Http request `Performance test with stringSize ${performanceSize}`, and the parameter `performanceSize` is taken from the JSR223 PreProcessor.
- JSR223 PreProcessor `Defining the string length`, which creates random string for `path`. If the default value `1` is provided, it will create random strings with length `10`, `50`,`100`, `500`, `1000` and pass them for the performance requests. If the user specify any other value, it will create random string with the desired length and pass them for the peformance tests.


## Test Execution

### GUI Mode

This mode should be used only for debugging, investigating or modifying the scripts. The process is quite straight-forward:
- Start **jMeter** in GUI mode with:
```
jmeter
```
This assumes you have jMeter in the path.
- Load the master test plan from "File -> Open" and choose  `plan-devowelizer.jmx` file.
- If needed, enable the `View Results Tree` listener to view each request details. To do that, use right mouse click on the element and select "Enable"
- Start the test by clicking the `green arrow` or from "Run -> Start"
- Use the listeners to analyze the application behavior

### Running test  from command line
This is the recommended mode to execute the test plan. It can be easily integrated into Jenkins, using this [plugin](https://wiki.jenkins.io/display/JENKINS/JMeter+Plugin).

The command to run the test is:

**Minimum parameters** ( it will use the default values, described in "Master Test Plan", "Configuration" section):
```
jmeter -n -t plan-devowelizer.jmx -l results.csv
```
where results.csv file contains information for each sampler.

**All parameters example**
```
jmeter -Jhost=localhost -Jport=8080 -Jprotocol=http -Jnrthreads=20 -JcsvFile=testInputs.csv -JloopCount=20 -JincludeFunctionalTests=true -JincludePerformanceTests=true -JperformanceLengthString=1500 -JdurationResponseTime=6000 -n -t plan-devowelizer.jmx -l results.csv -e -o automaticReport
```
where **-e -o automaticReport** is the destination for the report, described in section "Report Generation".

### Report Generation
Example of the report can be seen [here](./report/). Clone the repository and open index.html in any browser.
More details about the report dashboard can be found [here](https://jmeter.apache.org/usermanual/generating-dashboard.html):

The report is autogenerated when to the command above is appended the following:
`-e -o reportFolder`, so the whole command becomes:
```
jmeter -n -t plan-devowelizer.jmx -l results.csv -e -o reportFolder
```
During the test execution jMeter will report similar information into the console or jMeter.log:
```
jmeter -n -t plan-devowelizer.jmx -l results.csv -e -o reportFolder
Creating summariser <summary>
Created the tree successfully using ..\scripts\plan-devowelizer.jmx
Starting the test @ Sun May 19 18:56:57 EEST 2019 (1558281417524)
Waiting for possible Shutdown/StopTestNow/HeapDump/ThreadDump message on port 4445
summary +      1 in 00:00:04 =    0.2/s Avg:    47 Min:    47 Max:    47 Err:     0 (0.00%) Active: 1 Started: 1 Finished: 0
summary +     10 in 00:00:29 =    0.3/s Avg:  2377 Min:     7 Max:  5028 Err:     1 (10.00%) Active: 1 Started: 1 Finished: 0
summary =     11 in 00:00:34 =    0.3/s Avg:  2166 Min:     7 Max:  5028 Err:     1 (9.09%)
summary +     96 in 00:00:29 =    3.3/s Avg:  3718 Min:     8 Max:  5062 Err:    25 (26.04%) Active: 30 Started: 31 Finished: 1
summary =    107 in 00:01:03 =    1.7/s Avg:  3559 Min:     7 Max:  5062 Err:    26 (24.30%)
summary +    309 in 00:00:29 =   10.6/s Avg:  3929 Min:     5 Max:  5165 Err:    68 (22.01%) Active: 59 Started: 60 Finished: 1
summary =    416 in 00:01:32 =    4.5/s Avg:  3834 Min:     5 Max:  5165 Err:    94 (22.60%)
summary +    541 in 00:00:30 =   18.1/s Avg:  3975 Min:     4 Max:  5111 Err:   114 (21.07%) Active: 89 Started: 90 Finished: 1
summary =    957 in 00:02:02 =    7.8/s Avg:  3914 Min:     4 Max:  5165 Err:   208 (21.73%)
summary +    720 in 00:00:30 =   24.0/s Avg:  4014 Min:     3 Max:  5139 Err:   146 (20.28%) Active: 100 Started: 101 Finished: 1
```
Once the test finished jMeter will report as following:
```
summary =  50011 in 00:37:43 =   22.1/s Avg:  4051 Min:     3 Max:  5642 Err: 10001 (20.00%)
Tidying up ...    @ Sun May 19 19:34:40 EEST 2019 (1558283680802)
... end of run
```
And report can be access by loading into any browser the **index.html** file, located in folder **reportFolder**
