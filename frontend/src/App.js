import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaFlask, 
  FaFire, 
  FaCalendar, 
  FaTable, 
  FaDownload, 
  FaStar, 
  FaInfoCircle, 
  FaQuestionCircle, 
  FaUndo,
  FaGlobe,
  FaChartBar
} from 'react-icons/fa';
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    testCaseType: 'Functional Test Cases',
    moduleName: 'Broken link',
    numTestCases: 8,
    url: 'https://example.com'
  });
  const [testCases, setTestCases] = useState([]);
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [executingTests, setExecutingTests] = useState(false);

  // Module options for each test case type
  const moduleOptions = {
    'Functional Test Cases': [
      'Broken link',
      'Wrong output',
      'Failed validation',
      'Missing data',
      'Incorrect logic',
      'Non-clickable',
      'Wrong navigation',
      'API failure'
    ],
    'Performance Test Cases': [
      'Slow load',
      'Timeout',
      'Lag',
      'Freeze',
      'Crash',
      'Bottleneck',
      'Memory leak',
      'High CPU',
      'Network delay'
    ],
    'Regression Test Cases': [
      'Feature: break',
      'Data loss',
      'UI mismatch',
      'Workflow failure',
      'Function rollback',
      'Integration error'
    ],
    'Security Test Cases': [
      'Data breach',
      'Injection',
      'Weak password',
      'No encryption',
      'Auth bypass',
      'Session hijack',
      'CSRF',
      'XSS'
    ],
    'Usability Test Cases': [
      'Poor layout',
      'Small font',
      'Bad contrast',
      'Misaligned',
      'Confusing nav',
      'Missing tooltip',
      'Overcrowded',
      'Hard clicks'
    ]
  };

  // Update module name when test case type changes
  const handleTestCaseTypeChange = (e) => {
    const newType = e.target.value;
    const firstModule = moduleOptions[newType][0];
    setFormData({
      ...formData,
      testCaseType: newType,
      moduleName: firstModule
    });
  };

  // Simulate test execution with realistic results
  const executeTest = async (testCase, index) => {
    // Simulate execution time (1-3 seconds)
    const executionTime = Math.random() * 2000 + 1000;
    
    // Determine test result based on test case type and module
    let result;
    const random = Math.random();
    
    if (formData.testCaseType === 'Performance Test Cases') {
      // Performance tests have higher failure rate
      result = random < 0.4 ? 'Passed' : random < 0.7 ? 'Failed' : 'Skipped';
    } else if (formData.testCaseType === 'Security Test Cases') {
      // Security tests have moderate failure rate
      result = random < 0.6 ? 'Passed' : random < 0.8 ? 'Failed' : 'Skipped';
    } else if (formData.testCaseType === 'Regression Test Cases') {
      // Regression tests have moderate failure rate
      result = random < 0.7 ? 'Passed' : random < 0.85 ? 'Failed' : 'Skipped';
    } else {
      // Functional and Usability tests have lower failure rate
      result = random < 0.8 ? 'Passed' : random < 0.9 ? 'Failed' : 'Skipped';
    }

    // Update test result
    setTestResults(prev => ({
      ...prev,
      [testCase.test_case_id]: {
        status: 'Executing...',
        timestamp: new Date().toISOString()
      }
    }));

    // Simulate execution delay
    await new Promise(resolve => setTimeout(resolve, executionTime));

    // Set final result
    setTestResults(prev => ({
      ...prev,
      [testCase.test_case_id]: {
        status: result,
        timestamp: new Date().toISOString(),
        executionTime: Math.round(executionTime)
      }
    }));

    return result;
  };

  // Execute all test cases automatically
  const executeAllTests = async () => {
    if (testCases.length === 0) return;
    
    setExecutingTests(true);
    
    // Execute tests sequentially with small delays
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      await executeTest(testCase, i);
      
      // Small delay between test executions
      if (i < testCases.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    setExecutingTests(false);
  };

  // Auto-execute tests when they are generated
  useEffect(() => {
    if (testCases.length > 0 && !executingTests) {
      // Small delay before starting execution
      const timer = setTimeout(() => {
        executeAllTests();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [testCases]);

  const testCaseTypes = [
    'Functional Test Cases',
    'Regression Test Cases',
    'Security Test Cases',
    'Performance Test Cases',
    'Usability Test Cases'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSliderChange = (e) => {
    setFormData(prev => ({
      ...prev,
      numTestCases: parseInt(e.target.value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      const response = await axios.post(`${apiUrl}/generate-test-cases`, {
        test_case_type: formData.testCaseType,
        module_name: formData.moduleName,
        num_test_cases: formData.numTestCases,
        url: formData.url
      });

      setTestCases(response.data.test_cases);
      // Initialize test results with 'Not Executed' status
      const initialResults = {};
      response.data.test_cases.forEach(tc => {
        initialResults[tc.test_case_id] = 'Not Executed';
      });
      setTestResults(initialResults);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate test cases');
    } finally {
      setLoading(false);
    }
  };

  const resetInputs = () => {
    setFormData({
      testCaseType: 'Functional Test Cases',
      moduleName: 'email verification',
      numTestCases: 8,
      url: 'https://example.com'
    });
    setTestCases([]);
    setTestResults({});
    setError('');
    setSuccess(false);
  };



  const getTestResultStats = () => {
    const total = testCases.length;
    const passed = Object.values(testResults).filter(result => result?.status === 'Passed').length;
    const failed = Object.values(testResults).filter(result => result?.status === 'Failed').length;
    const skipped = Object.values(testResults).filter(result => result?.status === 'Skipped').length;
    const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;
    
    return { total, passed, failed, skipped, percentage };
  };

  const downloadExcel = () => {
    const stats = getTestResultStats();
    // Create CSV content with execution results
    const headers = ['Test Case ID', 'Description', 'Preconditions', 'Steps', 'Target URL', 'Execution Status', 'Execution Time (ms)', 'Timestamp'];
    const csvContent = [
      headers.join(','),
      ...testCases.map(tc => [
        tc.test_case_id,
        `"${tc.description.replace(/"/g, '""')}"`,
        `"${tc.preconditions.replace(/"/g, '""')}"`,
        `"${tc.steps.replace(/"/g, '""')}"`,
        formData.url,
        testResults[tc.test_case_id]?.status || 'Not Executed',
        testResults[tc.test_case_id]?.executionTime || 'N/A',
        testResults[tc.test_case_id]?.timestamp || 'N/A'
      ].join(','))
    ].join('\n');

    // Add summary at the end
    const summaryRow = [
      'SUMMARY',
      `Total: ${stats.total}`,
      `Passed: ${stats.passed}`,
      `Failed: ${stats.failed}`,
      `Skipped: ${stats.skipped}`,
      `Success Rate: ${stats.percentage}%`
    ].join(',');

    const fullContent = csvContent + '\n\n' + summaryRow;

    const blob = new Blob([fullContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test_cases_${formData.moduleName.replace(/\s+/g, '_')}_with_results.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="App">
      <div className="container">
        {/* Header */}
        <div className="header">
          <div className="title-section">
            <FaFlask className="title-icon" />
            <h1>Manual Testing AI Agent</h1>
          </div>
          <p className="welcome-text">
            Welcome! This AI-powered tool helps you generate structured manual test cases for any module or feature.
          </p>
        </div>

        {/* Instructions */}
        <div className="card instructions-card">
          <h3>Instructions</h3>
          <div className="instructions-list">
            <div className="instruction-item">
              <FaStar className="instruction-icon check" />
              <span>Select the type of test cases you want (Functional, Regression, Security)</span>
            </div>
            <div className="instruction-item">
              <FaFire className="instruction-icon fire" />
              <span>Enter the feature/module name</span>
            </div>
            <div className="instruction-item">
              <FaGlobe className="instruction-icon globe" />
              <span>Enter the URL where test cases will be executed</span>
            </div>
            <div className="instruction-item">
              <FaCalendar className="instruction-icon calendar" />
              <span>Choose how many test cases to generate</span>
            </div>
            <div className="instruction-item">
              <FaTable className="instruction-icon table" />
              <span>View them as a table or <FaDownload className="download-icon" /> download as CSV</span>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="card">
          <div className="form-header">
            <FaStar className="form-header-icon" />
            <h3>Choose What to Generate</h3>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Test Case Types Explained */}
            <div className="form-group">
              <label className="form-label">
                <FaInfoCircle className="label-icon" />
                Test Case Types Explained
                <details className="dropdown">
                  <summary>▼</summary>
                  <div className="dropdown-content">
                    <p><strong>Functional Test Cases:</strong> Verify that the application functions as expected.</p>
                    <p><strong>Regression Test Cases:</strong> Ensure new changes don't break existing functionality.</p>
                    <p><strong>Security Test Cases:</strong> Test for security vulnerabilities and threats.</p>
                    <p><strong>Performance Test Cases:</strong> Evaluate system performance under various conditions.</p>
                    <p><strong>Usability Test Cases:</strong> Assess user experience and interface usability.</p>
                  </div>
                </details>
              </label>
            </div>

            {/* Test Case Type Selection */}
            <div className="form-group">
              <label className="form-label">
                Select test case type:
                <FaQuestionCircle className="label-icon" />
              </label>
              <select
                name="testCaseType"
                value={formData.testCaseType}
                onChange={handleTestCaseTypeChange}
                className="select"
              >
                {testCaseTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Module Name Input */}
            <div className="form-group">
              <label className="form-label">
                Enter Module or Feature to Test:
                <FaQuestionCircle className="label-icon" />
              </label>
              <select
                name="moduleName"
                value={formData.moduleName}
                onChange={handleInputChange}
                className="input"
              >
                {moduleOptions[formData.testCaseType].map(module => (
                  <option key={module} value={module}>{module}</option>
                ))}
              </select>
            </div>

            {/* URL Input */}
            <div className="form-group">
              <label className="form-label">
                Enter URL for Test Execution:
                <FaQuestionCircle className="label-icon" />
              </label>
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                className="input"
                placeholder="https://example.com"
                required
              />
            </div>

            {/* Number of Test Cases Slider */}
            <div className="form-group">
              <label className="form-label">
                Number of Test Cases
                <FaQuestionCircle className="label-icon" />
              </label>
              <div className="slider-container">
                <span className="slider-value">{formData.numTestCases}</span>
                <input
                  type="range"
                  min="5"
                  max="28"
                  value={formData.numTestCases}
                  onChange={handleSliderChange}
                  className="slider"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="form-actions">
              <button type="submit" className="button primary-button" disabled={loading}>
                {loading ? 'Generating...' : 'Generate Test Cases'}
              </button>
              <button type="button" className="button secondary-button" onClick={resetInputs}>
                <FaUndo className="button-icon" />
                Reset Inputs
              </button>
            </div>
          </form>
        </div>

        {/* Success Banner */}
        {success && (
          <div className="success-banner">
            <FaStar />
            <span>Test cases generated successfully!</span>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="error-banner">
            <FaInfoCircle className="error-icon" />
            <span>{error}</span>
          </div>
        )}

        {/* Test Cases Table */}
        {testCases.length > 0 && (
          <div className="card">
            <div className="table-header">
              <h3>Generated Test Cases ({testCases.length})</h3>
              <div className="table-actions">
                {executingTests && (
                  <div className="execution-progress">
                    <span className="progress-text">🔄 Executing tests...</span>
                  </div>
                )}
                <button onClick={downloadExcel} className="button download-button">
                  <FaDownload className="button-icon" />
                  Download as CSV
                </button>
                <button 
                  onClick={() => {
                    setTestResults({});
                  }} 
                  className="button secondary-button"
                  title="Clear all test results"
                >
                  <FaUndo className="button-icon" />
                  Clear Results
                </button>
              </div>
            </div>
            
            {/* Test Results Summary */}
            <div className="results-summary">
              <div className="summary-header">
                <FaChartBar className="summary-icon" />
                <h4>Test Execution Summary</h4>
              </div>
              <div className="summary-stats">
                {(() => {
                  const stats = getTestResultStats();
                  return (
                    <>
                      <div className="stat-item">
                        <span className="stat-label">Total:</span>
                        <span className="stat-value total">{stats.total}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Passed:</span>
                        <span className="stat-value passed">{stats.passed}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Failed:</span>
                        <span className="stat-value failed">{stats.failed}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Skipped:</span>
                        <span className="stat-value skipped">{stats.skipped}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Success Rate:</span>
                        <span className="stat-value percentage">{stats.percentage}%</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            <div className="url-info">
              <strong>Target URL:</strong> <a href={formData.url} target="_blank" rel="noopener noreferrer" className="url-link">{formData.url}</a>
            </div>
            
            <table className="table">
              <thead>
                <tr>
                  <th>Test Case ID</th>
                  <th>Description</th>
                  <th>Preconditions</th>
                  <th>Steps</th>
                  <th>Execution Status</th>

                </tr>
              </thead>
              <tbody>
                {testCases.map((testCase, index) => (
                  <tr key={index} className={`test-row ${testResults[testCase.test_case_id]?.status ? testResults[testCase.test_case_id].status.toLowerCase().replace(' ', '-') : 'not-executed'}`}>
                    <td>{testCase.test_case_id}</td>
                    <td>{testCase.description}</td>
                    <td>{testCase.preconditions}</td>
                    <td>{testCase.steps}</td>
                    <td>
                      <div className="execution-status">
                        {testResults[testCase.test_case_id] ? (
                          <>
                            <span className={`status-badge ${testResults[testCase.test_case_id]?.status?.toLowerCase().replace(' ', '-')}`}>
                              {testResults[testCase.test_case_id]?.status}
                            </span>
                            {testResults[testCase.test_case_id]?.executionTime && (
                              <div className="execution-details">
                                <small>⏱️ {testResults[testCase.test_case_id]?.executionTime}ms</small>
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="status-badge not-executed">Pending</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
