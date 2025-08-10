from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from typing import List, Optional
import os
import json
import re
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv()

app = FastAPI(title="Manual Testing AI Agent", version="1.0.0")

@app.on_event("startup")
async def startup_event():
    print("🚀 Manual Testing AI Agent starting up...")
    print(f"Environment: {os.getenv('ENVIRONMENT', 'development')}")
    print(f"Allowed origins: {os.getenv('ALLOWED_ORIGINS', 'default')}")

# CORS configuration
origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,https://manustarter.vercel.app").split(",")
methods = os.getenv("ALLOWED_METHODS", "GET,POST,PUT,DELETE,OPTIONS").split(",")
headers = os.getenv("ALLOWED_HEADERS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=methods,
    allow_headers=headers,
)

# Initialize OpenAI client with proper configuration
api_key = os.getenv("OPENROUTER_API_KEY")
if not api_key:
    # Create a dummy client for now, will be validated when making requests
    client = None
else:
    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=api_key,
    )

class TestCaseRequest(BaseModel):
    test_case_type: str
    module_name: str
    num_test_cases: int = 8
    url: str

    @field_validator('test_case_type')
    @classmethod
    def validate_test_case_type(cls, v):
        allowed_types = [
            'Functional Test Cases',
            'Regression Test Cases', 
            'Security Test Cases',
            'Performance Test Cases',
            'Usability Test Cases'
        ]
        if v not in allowed_types:
            raise ValueError(f'Test case type must be one of: {", ".join(allowed_types)}')
        return v

    @field_validator('module_name')
    @classmethod
    def validate_module_name(cls, v):
        if not v.strip():
            raise ValueError('Module name cannot be empty')
        if len(v) > 100:
            raise ValueError('Module name cannot exceed 100 characters')
        return v.strip()

    @field_validator('num_test_cases')
    @classmethod
    def validate_num_test_cases(cls, v):
        if v < 1 or v > 50:
            raise ValueError('Number of test cases must be between 1 and 50')
        return v

    @field_validator('url')
    @classmethod
    def validate_url(cls, v):
        if not v.strip():
            raise ValueError('URL cannot be empty')
        if not v.startswith(('http://', 'https://')):
            raise ValueError('URL must start with http:// or https://')
        if len(v) > 500:
            raise ValueError('URL cannot exceed 500 characters')
        return v.strip()

class TestCase(BaseModel):
    test_case_id: str
    description: str
    preconditions: str
    steps: str

class TestCaseResponse(BaseModel):
    test_cases: List[TestCase]
    total_count: int

@app.get("/")
async def root():
    return {"message": "Manual Testing AI Agent API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Manual Testing AI Agent"}

@app.get("/test")
async def test_endpoint():
    return {"message": "Test endpoint working", "timestamp": "now"}

@app.post("/generate-test-cases", response_model=TestCaseResponse)
async def generate_test_cases(request: TestCaseRequest):
    try:
        # Validate API key and client
        api_key = os.getenv("OPENROUTER_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="OpenRouter API key not configured")
        
        # Initialize client if not already done
        if client is None:
            current_client = OpenAI(
                base_url="https://openrouter.ai/api/v1",
                api_key=api_key,
            )
        else:
            current_client = client
        
        # Create prompt for test case generation
        prompt = f"""
        Generate {request.num_test_cases} {request.test_case_type} test cases for the module/feature: {request.module_name} that will be executed on the URL: {request.url}.
        
        For each test case, provide:
        1. Test Case ID (format: TC_{request.module_name.upper().replace(' ', '_')}_XXX)
        2. Description - A clear, concise description of what the test case verifies
        3. Preconditions - What must be in place before executing this test case
        4. Steps - Detailed step-by-step instructions to execute the test case, including navigation to {request.url}
        
        Return the response in the following JSON format ONLY (no additional text):
        {{
            "test_cases": [
                {{
                    "test_case_id": "TC_EXAMPLE_001",
                    "description": "Verify that user can successfully log in with valid credentials",
                    "preconditions": "User account exists and is active",
                    "steps": "1. Navigate to {request.url}\\n2. Enter valid username\\n3. Enter valid password\\n4. Click login button\\n5. Verify successful login"
                }}
            ]
        }}
        
        Make sure the test cases are comprehensive and cover different scenarios including:
        - Positive test cases (valid inputs)
        - Negative test cases (invalid inputs)
        - Edge cases (boundary conditions)
        - Error scenarios
        
        Focus on practical, executable test cases that would be useful for manual testing on the specified URL.
        """
        
        # Call the AI model
        try:
            completion = current_client.chat.completions.create(
                extra_headers={
                    "HTTP-Referer": os.getenv("SITE_URL", "http://localhost:3000"),
                    "X-Title": os.getenv("SITE_NAME", "Manual Testing AI Agent"),
                },
                extra_body={},
                model="qwen/qwen-2.5-72b-instruct:free",
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,  # Lower temperature for more consistent output
                max_tokens=4000   # Increased token limit for better responses
            )
        except Exception as api_error:
            raise HTTPException(status_code=500, detail=f"AI service error: {str(api_error)}")
        
        # Parse the response
        response_content = completion.choices[0].message.content
        
        # Try to extract JSON from the response
        test_cases = []
        
        # First, try to parse as pure JSON
        try:
            parsed_response = json.loads(response_content.strip())
            if isinstance(parsed_response, dict) and "test_cases" in parsed_response:
                for tc in parsed_response["test_cases"]:
                    test_case = TestCase(
                        test_case_id=tc.get("test_case_id", f"TC_{request.module_name.upper().replace(' ', '_')}_{len(test_cases)+1:03d}"),
                        description=tc.get("description", ""),
                        preconditions=tc.get("preconditions", ""),
                        steps=tc.get("steps", "")
                    )
                    test_cases.append(test_case)
            else:
                raise ValueError("Invalid JSON structure")
        except (json.JSONDecodeError, ValueError):
            # Try to extract JSON using regex
            json_match = re.search(r'\{[^{}]*(?:{[^{}]*}[^{}]*)*\}', response_content, re.DOTALL)
            if json_match:
                try:
                    parsed_response = json.loads(json_match.group())
                    if isinstance(parsed_response, dict) and "test_cases" in parsed_response:
                        for tc in parsed_response["test_cases"]:
                            test_case = TestCase(
                                test_case_id=tc.get("test_case_id", f"TC_{request.module_name.upper().replace(' ', '_')}_{len(test_cases)+1:03d}"),
                                description=tc.get("description", ""),
                                preconditions=tc.get("preconditions", ""),
                                steps=tc.get("steps", "")
                            )
                            test_cases.append(test_case)
                    else:
                        raise ValueError("Invalid JSON structure")
                except (json.JSONDecodeError, ValueError):
                    # Fallback to generating test cases manually
                    test_cases = generate_fallback_test_cases(request)
            else:
                # Fallback to generating test cases manually
                test_cases = generate_fallback_test_cases(request)
        
        # Ensure we have the requested number of test cases
        if len(test_cases) < request.num_test_cases:
            additional_cases = generate_fallback_test_cases(request, request.num_test_cases - len(test_cases))
            test_cases.extend(additional_cases)
        elif len(test_cases) > request.num_test_cases:
            test_cases = test_cases[:request.num_test_cases]
        
        return TestCaseResponse(
            test_cases=test_cases,
            total_count=len(test_cases)
        )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating test cases: {str(e)}")

def generate_fallback_test_cases(request: TestCaseRequest, num_cases: Optional[int] = None) -> List[TestCase]:
    """Generate fallback test cases if AI response parsing fails"""
    if num_cases is None:
        num_cases = request.num_test_cases
    
    test_cases = []
    module_id = request.module_name.upper().replace(' ', '_')
    
    # Generate different types of test cases based on the test case type
    test_case_templates = {
        'Functional Test Cases': [
            'Verify {feature} functionality works correctly',
            'Test {feature} with valid inputs',
            'Validate {feature} error handling',
            'Check {feature} integration points'
        ],
        'Regression Test Cases': [
            'Ensure {feature} still works after recent changes',
            'Verify {feature} backward compatibility',
            'Test {feature} with existing data',
            'Validate {feature} performance after updates'
        ],
        'Security Test Cases': [
            'Test {feature} authentication requirements',
            'Verify {feature} authorization controls',
            'Validate {feature} input sanitization',
            'Check {feature} for potential vulnerabilities'
        ],
        'Performance Test Cases': [
            'Test {feature} response time under normal load',
            'Verify {feature} performance with large datasets',
            'Validate {feature} memory usage',
            'Check {feature} scalability limits'
        ],
        'Usability Test Cases': [
            'Test {feature} user interface navigation',
            'Verify {feature} accessibility features',
            'Validate {feature} user experience flow',
            'Check {feature} error message clarity'
        ]
    }
    
    templates = test_case_templates.get(request.test_case_type, test_case_templates['Functional Test Cases'])
    
    for i in range(num_cases):
        template = templates[i % len(templates)]
        test_case = TestCase(
            test_case_id=f"TC_{module_id}_{i+1:03d}",
            description=template.format(feature=request.module_name),
            preconditions=f"User is logged in and {request.module_name} module is accessible",
            steps=f"1. Navigate to {request.url}\\n2. Access {request.module_name} module\\n3. Perform required actions\\n4. Verify expected results\\n5. Document any issues found"
        )
        test_cases.append(test_case)
    
    return test_cases

if __name__ == "__main__":
    import uvicorn
    # Only run uvicorn locally
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "127.0.0.1"),
        port=int(os.getenv("PORT", 3000)),
        reload=True
    )
