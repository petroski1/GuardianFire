#!/usr/bin/env python3
import requests
import sys
import json
from datetime import datetime
import time

class GuardianFireAPITester:
    def __init__(self, base_url="https://collision-sense.preview.emergentagent.com"):
        self.base_url = base_url
        self.session_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, response_data=None, error=None):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test_name": name,
            "success": success,
            "timestamp": datetime.now().isoformat(),
            "response_data": response_data,
            "error": str(error) if error else None
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        if error:
            print(f"    Error: {error}")
        if response_data and not success:
            print(f"    Response: {response_data}")

    def test_api_call(self, name, method, endpoint, expected_status=200, data=None, headers=None):
        """Make API call and validate response"""
        url = f"{self.base_url}/api/{endpoint}"
        
        # Default headers
        default_headers = {'Content-Type': 'application/json'}
        if headers:
            default_headers.update(headers)
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=default_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=default_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=default_headers)
            
            success = response.status_code == expected_status
            
            try:
                response_data = response.json() if response.content else {}
            except json.JSONDecodeError:
                response_data = {"raw_response": response.text[:200]}
            
            self.log_test(name, success, response_data, 
                         None if success else f"Expected {expected_status}, got {response.status_code}")
            
            return success, response_data
            
        except Exception as e:
            self.log_test(name, False, None, e)
            return False, {}

    def test_health_endpoint(self):
        """Test health check endpoint"""
        return self.test_api_call("Health Check", "GET", "health")

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.test_api_call("Root API", "GET", "")

    def test_seed_demo_data(self):
        """Test seeding demo data"""
        success, data = self.test_api_call("Seed Demo Data", "POST", "seed-demo-data")
        if success:
            print(f"    Seeded {data.get('sectors', 0)} sectors")
        return success, data

    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        return self.test_api_call("Dashboard Stats", "GET", "dashboard/stats")

    def test_sectors_crud(self):
        """Test sectors CRUD operations"""
        # Get all sectors
        success, data = self.test_api_call("Get Sectors", "GET", "sectors")
        
        if success and data:
            # Test getting a specific sector
            sector_id = data[0].get('sector_id') if data else None
            if sector_id:
                self.test_api_call("Get Specific Sector", "GET", f"sectors/{sector_id}")
        
        return success

    def test_sensors_crud(self):
        """Test sensors CRUD operations"""
        return self.test_api_call("Get Sensors", "GET", "sensors")

    def test_alerts_crud(self):
        """Test alerts CRUD operations"""
        success, data = self.test_api_call("Get Alerts", "GET", "alerts")
        
        # Test filtered alerts
        self.test_api_call("Get Active Alerts", "GET", "alerts?status=active")
        
        return success

    def test_work_orders_crud(self):
        """Test work orders CRUD operations"""
        success, data = self.test_api_call("Get Work Orders", "GET", "work-orders")
        
        # Test filtered work orders  
        self.test_api_call("Get Pending Work Orders", "GET", "work-orders?status=pending")
        
        return success

    def test_context_variables(self):
        """Test context variables endpoint"""
        return self.test_api_call("Get Context Variables", "GET", "context")

    def test_behavioral_reports(self):
        """Test behavioral reports endpoint"""
        return self.test_api_call("Get Behavioral Reports", "GET", "reports")

    def test_ai_risk_analysis(self):
        """Test AI risk analysis (with fallback expected)"""
        # First get a sector ID
        success, sectors = self.test_api_call("Get Sectors for AI Test", "GET", "sectors")
        
        if success and sectors:
            sector_id = sectors[0].get('sector_id')
            if sector_id:
                # Test AI analysis - this may fail gracefully
                analysis_success, analysis_data = self.test_api_call(
                    "AI Risk Analysis", "POST", "analyze-risk", 
                    data={"sector_id": sector_id}
                )
                
                if analysis_success:
                    print(f"    Risk Score: {analysis_data.get('risk_score', 'N/A')}%")
                    print(f"    Risk Status: {analysis_data.get('risk_status', 'N/A')}")
                    if analysis_data.get('error'):
                        print(f"    AI Fallback Used: {analysis_data['error']}")
                
                return analysis_success, analysis_data
        
        self.log_test("AI Risk Analysis", False, None, "No sectors available for testing")
        return False, {}

    def run_full_test_suite(self):
        """Run all tests in sequence"""
        print("🔥 GuardianFire AI API Testing Suite")
        print("=" * 50)
        
        # Basic health checks
        print("\n📊 Basic Health Tests")
        self.test_health_endpoint()
        self.test_root_endpoint()
        
        # Seed data first
        print("\n🌱 Data Seeding")
        seed_success, _ = self.test_seed_demo_data()
        
        if not seed_success:
            print("⚠️  Warning: Demo data seeding failed. Some tests may fail.")
        
        # Wait a moment for data to be ready
        time.sleep(1)
        
        # Core CRUD operations
        print("\n📋 Core CRUD Operations")
        self.test_dashboard_stats()
        self.test_sectors_crud()
        self.test_sensors_crud()
        self.test_alerts_crud()
        self.test_work_orders_crud()
        
        # Additional features
        print("\n🔧 Additional Features")
        self.test_context_variables()
        self.test_behavioral_reports()
        
        # AI Integration (may use fallback)
        print("\n🤖 AI Integration")
        self.test_ai_risk_analysis()
        
        # Print final results
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return 1

    def get_test_summary(self):
        """Get summary of test results"""
        failed_tests = [t for t in self.test_results if not t['success']]
        passed_tests = [t for t in self.test_results if t['success']]
        
        return {
            "total_tests": self.tests_run,
            "passed_tests": self.tests_passed,
            "failed_tests": len(failed_tests),
            "success_rate": f"{(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%",
            "failed_test_names": [t['test_name'] for t in failed_tests],
            "passed_test_names": [t['test_name'] for t in passed_tests]
        }

def main():
    tester = GuardianFireAPITester()
    exit_code = tester.run_full_test_suite()
    
    # Save detailed results
    with open('/tmp/backend_test_results.json', 'w') as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "summary": tester.get_test_summary(),
            "detailed_results": tester.test_results
        }, f, indent=2)
    
    print(f"\n📁 Detailed results saved to /tmp/backend_test_results.json")
    return exit_code

if __name__ == "__main__":
    sys.exit(main())