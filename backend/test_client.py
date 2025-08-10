#!/usr/bin/env python3
"""
Simple test script to verify OpenAI client compatibility
"""

import os
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv()

def test_openai_client():
    """Test if OpenAI client can be initialized without errors"""
    try:
        api_key = os.getenv("OPENROUTER_API_KEY")
        if not api_key:
            print("⚠️  No OPENROUTER_API_KEY found in environment variables")
            print("   This is expected if you haven't set it up yet.")
            return True
        
        print("🔑 Found API key, testing client initialization...")
        
        # Initialize client
        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key,
        )
        
        print("✅ OpenAI client initialized successfully!")
        print(f"   Base URL: {client.base_url}")
        print(f"   API Key: {'*' * (len(api_key) - 4) + api_key[-4:] if len(api_key) > 4 else '***'}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error initializing OpenAI client: {str(e)}")
        return False

if __name__ == "__main__":
    print("🧪 Testing OpenAI client compatibility...")
    success = test_openai_client()
    
    if success:
        print("\n🎉 Test completed successfully!")
        print("   You can now run the main application with: python main.py")
    else:
        print("\n💥 Test failed!")
        print("   Please check the error message above and fix the issue.")
