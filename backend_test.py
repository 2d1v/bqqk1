import requests
import sys
import json
from datetime import datetime

class RobloxScriptAPITester:
    def __init__(self, base_url="https://roblox-script-8.preview.emergentagent.com"):
        self.base_url = base_url
        self.auth_key = "Āă↺↙₥Ⅱ₲ď℉⁐ↈă﷼↙ɱə"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, params=params, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, params=params, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, params=params, timeout=10)

            success = response.status_code == expected_status
            
            result = {
                'test_name': name,
                'method': method,
                'endpoint': endpoint,
                'expected_status': expected_status,
                'actual_status': response.status_code,
                'success': success,
                'response_data': None,
                'error': None
            }

            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    result['response_data'] = response.json()
                except:
                    result['response_data'] = response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    result['error'] = response.json()
                except:
                    result['error'] = response.text

            self.test_results.append(result)
            return success, response.json() if success and response.text else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            result = {
                'test_name': name,
                'method': method,
                'endpoint': endpoint,
                'expected_status': expected_status,
                'actual_status': 'ERROR',
                'success': False,
                'response_data': None,
                'error': str(e)
            }
            self.test_results.append(result)
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API", "GET", "", 200)

    def test_user_info(self, user_id=1):
        """Test user info endpoint"""
        return self.run_test(
            f"Get User Info (ID: {user_id})",
            "GET",
            f"v1/user/{user_id}",
            200
        )

    def test_get_script_data(self, place_id=123456, user_id=1):
        """Test getting script data"""
        params = {
            'id': place_id,
            'user?id': user_id,
            'auth?key': self.auth_key
        }
        return self.run_test(
            "Get Script Data",
            "GET",
            "v1/place",
            200,
            params=params
        )

    def test_update_script_data(self, place_id=123456, user_id=1):
        """Test updating script data"""
        params = {
            'id': place_id,
            'user?id': user_id,
            'auth?key': self.auth_key
        }
        data = {
            'CanExecutable': True,
            'Source': 'print("Hello from test!")'
        }
        return self.run_test(
            "Update Script Data",
            "POST",
            "v1/place",
            200,
            data=data,
            params=params
        )

    def test_get_scripts(self):
        """Test getting script hub scripts"""
        return self.run_test(
            "Get Script Hub Scripts",
            "GET",
            "v1/scripts",
            200
        )

    def test_create_script(self):
        """Test creating a new script"""
        data = {
            'title': 'Test Script',
            'subtitle': 'A test script for validation',
            'category': 'Fun',
            'code': 'print("Test script code")'
        }
        return self.run_test(
            "Create Script Hub Script",
            "POST",
            "v1/scripts",
            200,
            data=data
        )

    def test_ai_chat(self):
        """Test AI chat endpoint"""
        data = {
            'message': 'Write a simple Luau print statement'
        }
        return self.run_test(
            "AI Chat",
            "POST",
            "v1/ai/chat",
            200,
            data=data
        )

    def test_tabs_crud(self, place_id=123456, user_id=1):
        """Test tab CRUD operations"""
        # Get tabs
        params = {'placeId': place_id, 'userId': user_id}
        success, _ = self.run_test(
            "Get Tabs",
            "GET",
            "v1/tabs",
            200,
            params=params
        )

        # Create tab
        data = {
            'placeId': place_id,
            'userId': user_id,
            'name': 'test_tab.lua',
            'content': '-- Test tab content'
        }
        success, response = self.run_test(
            "Create Tab",
            "POST",
            "v1/tabs",
            200,
            data=data
        )

        tab_id = None
        if success and 'id' in response:
            tab_id = response['id']
            
            # Update tab
            update_data = {
                'name': 'updated_tab.lua',
                'content': '-- Updated content'
            }
            self.run_test(
                "Update Tab",
                "PUT",
                f"v1/tabs/{tab_id}",
                200,
                data=update_data
            )

            # Delete tab
            self.run_test(
                "Delete Tab",
                "DELETE",
                f"v1/tabs/{tab_id}",
                200
            )

    def test_auth_validation(self):
        """Test authentication validation"""
        # Test with wrong auth key
        params = {
            'id': 123456,
            'user?id': 1,
            'auth?key': 'wrong_key'
        }
        self.run_test(
            "Invalid Auth Key",
            "GET",
            "v1/place",
            403,
            params=params
        )

    def test_whitelist_validation(self):
        """Test whitelist validation with non-whitelisted user"""
        # Using a user ID that should return a non-whitelisted username
        params = {
            'id': 123456,
            'user?id': 999999999,  # Very high ID likely to be non-whitelisted
            'auth?key': self.auth_key
        }
        # This should return 403 if user is not whitelisted
        # But might return 200 if user doesn't exist and gets "Unknown" username
        self.run_test(
            "Non-whitelisted User",
            "GET",
            "v1/place",
            403,  # Expected to fail due to whitelist
            params=params
        )

def main():
    print("🚀 Starting Roblox Script Commander API Tests")
    print("=" * 60)
    
    tester = RobloxScriptAPITester()
    
    # Run all tests
    print("\n📋 Running Basic API Tests...")
    tester.test_root_endpoint()
    
    print("\n👤 Testing User Management...")
    tester.test_user_info(1)  # Test with user ID 1
    
    print("\n📜 Testing Script Data Management...")
    tester.test_get_script_data()
    tester.test_update_script_data()
    
    print("\n🏪 Testing Script Hub...")
    tester.test_get_scripts()
    tester.test_create_script()
    
    print("\n🤖 Testing AI Integration...")
    tester.test_ai_chat()
    
    print("\n📑 Testing Tab Management...")
    tester.test_tabs_crud()
    
    print("\n🔐 Testing Security...")
    tester.test_auth_validation()
    tester.test_whitelist_validation()
    
    # Print final results
    print("\n" + "=" * 60)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return_code = 0
    else:
        print("⚠️  Some tests failed. Check the details above.")
        return_code = 1
    
    # Save detailed results
    results_file = f"/app/test_reports/backend_test_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(results_file, 'w') as f:
        json.dump({
            'summary': {
                'total_tests': tester.tests_run,
                'passed_tests': tester.tests_passed,
                'failed_tests': tester.tests_run - tester.tests_passed,
                'success_rate': f"{(tester.tests_passed/tester.tests_run)*100:.1f}%"
            },
            'detailed_results': tester.test_results
        }, f, indent=2)
    
    print(f"📄 Detailed results saved to: {results_file}")
    
    return return_code

if __name__ == "__main__":
    sys.exit(main())