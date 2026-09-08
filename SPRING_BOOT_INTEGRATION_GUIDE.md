# Spring Boot Backend Integration Guide

This guide describes how to connect this React + Vite frontend to your **Spring Boot** backend. The frontend is configured to consume RESTful endpoints using Axios, with support for JSON Web Tokens (JWT) and persistent state management.

---

## ⚙️ 1. Connecting the Frontend to Spring Boot

The frontend uses an Axios client instance defined in `src/services/api.ts` to manage all API calls. By default, it looks for the `VITE_API_URL` environment variable.

### Configuration
1. Open your workspace settings or create a `.env` file in the root directory.
2. Define the URL of your Spring Boot service (usually port `8080` in local development):
   ```env
   VITE_API_URL="http://localhost:8080"
   ```
3. If `VITE_API_URL` is omitted, the frontend will fallback to making relative requests (serving from the same port).

---

## 🔒 2. Handling CORS in Spring Boot

Since the React app runs on a different port than Spring Boot during local development, you must enable Cross-Origin Resource Sharing (CORS).

### Option A: Global CORS Configuration (Recommended)
Create a configuration class in your Spring Boot project to allow requests from your frontend:

```java
package com.edupredict.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins("http://localhost:3000", "https://your-frontend-domain.com")
                        .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
}
```

### Option B: Controller-Level CORS
Alternatively, annotate your REST Controllers directly:
```java
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AuthController {
    // ...
}
```

---

## 🔑 3. Authentication & JWT Strategy

The React frontend sends a JWT bearer token inside the `Authorization` header on every request if authenticated:
```http
Authorization: Bearer <your_jwt_token>
```

### Token Expiration & Refresh Flow
The frontend handles token expiration gracefully:
1. When a request returns a `401 Unauthorized` status, the frontend automatically intercepts it.
2. It sends a `POST` request to `/api/auth/refresh` containing the stored `refreshToken`.
3. If successful, it updates the access token in local storage and retries the failed request.
4. If the refresh request fails, it signs out the user and redirects to `/login`.

---

## 📊 4. API Endpoints Map

Map your Spring Boot `RestController` paths to match these expected REST endpoints:

### 🔐 Authentication (`/api/auth/*`)
| HTTP Method | Endpoint | Request Body (JSON) | Response Payload (JSON) |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/login` | `{ "email", "password", "mockRole" }` | `{ "user": { "id", "name", "email", "role", "department", "avatarUrl" }, "token", "refreshToken" }` |
| **POST** | `/api/auth/refresh` | `{ "email", "refreshToken" }` | `{ "token", "refreshToken" }` |
| **POST** | `/api/auth/logout` | *None* | *None* (Clear session cookies / blacklists) |
| **POST** | `/api/auth/register` | `{ "name", "email", "phone", "role", "department" }` | Success response status |
| **POST** | `/api/auth/forgot-password`| `{ "email" }` | Success status (Dispatches OTP code) |
| **POST** | `/api/auth/verify-otp` | `{ "email", "otp" }` | `{ "success": true/false }` |
| **POST** | `/api/auth/reset-password` | `{ "email", "password" }` | Success status (Updates password) |

---

### 🎓 Student Operations (`/api/student/*`)
| HTTP Method | Endpoint | Request / Query Parameters | Response Payload (JSON) |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/student/profile` | Bearer Token in Header | `{ "id", "name", "email", "department", "semester", "cgpa", "attendance" }` |
| **GET** | `/api/student/attendance` | Bearer Token in Header | `{ "overall", "history": [ { "date", "status", "subject" } ] }` |
| **GET** | `/api/student/academics` | Bearer Token in Header | `{ "gpaHistory": [], "subjects": [] }` |
| **GET** | `/api/student/assignments`| Bearer Token in Header | List of assignment objects |
| **GET** | `/api/student/risk` | Bearer Token in Header | `{ "dropoutProbability", "riskLevel", "shapValues": [] }` |
| **GET** | `/api/student/recommendations`| Bearer Token in Header| List of learning / support recommendations |
| **GET** | `/api/student/sessions` | Bearer Token in Header | List of booked counseling sessions |
| **POST** | `/api/student/sessions` | `{ "counselorId", "date", "timeSlot", "reason" }` | Created counseling session object |

---

### 🏫 Faculty Console (`/api/faculty/*`)
| HTTP Method | Endpoint | Request / Query Parameters | Response Payload (JSON) |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/faculty/profile` | Bearer Token | Faculty profile details |
| **GET** | `/api/faculty/stats` | Bearer Token | General class performance metrics |
| **GET** | `/api/faculty/students` | Bearer Token | Cohort list of student summaries |
| **POST** | `/api/faculty/students/{studentId}/attendance` | `{ "subjectCode", "attendanceValue" }` | Updated student object |
| **POST** | `/api/faculty/students/{studentId}/marks` | `{ "subjectCode", "internalMarks" }` | Updated student object |
| **GET** | `/api/faculty/assignments` | Bearer Token | List of created assignments |
| **POST** | `/api/faculty/assignments` | `{ "title", "subjectCode", "dueDate", "maxMarks" }` | Created assignment object |

---

### 💬 Counselor Terminal (`/api/counselor/*`)
| HTTP Method | Endpoint | Request / Query Parameters | Response Payload (JSON) |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/counselor/stats` | Bearer Token | General counseling pipeline metrics |
| **GET** | `/api/counselor/students` | Bearer Token | Detailed case list of assigned students |
| **GET** | `/api/counselor/students/{id}` | Student ID path parameter | Complete student record & risk indicators |
| **GET** | `/api/counselor/sessions` | Bearer Token | Active counseling scheduler registry |
| **POST** | `/api/counselor/sessions` | `{ "studentId", "date", "timeSlot", "reason" }` | Newly booked session object |
| **PUT** | `/api/counselor/sessions/{id}`| `{ "status", "notes" }` | Updated counseling session object |
| **DELETE**| `/api/counselor/sessions/{id}`| Session ID path parameter | Success status |

---

### 🧠 AI Predictions (`/api/predict`, `/api/model/*`)
| HTTP Method | Endpoint | Request / Query Parameters | Response Payload (JSON) |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/predict` | `{ "attendance", "cgpa", "backlogs", "familyIncome", "extraCurricular" }` | `{ "dropoutProbability", "riskLevel", "shapExplanation": {}, "aiStrategyMarkdown" }` |
| **GET** | `/api/predictions/history` | Bearer Token | Historical logs of execution runs |
| **GET** | `/api/model/metrics` | Bearer Token | Performance stats (Precision, Recall, ROC Curve coordinates) |

---

## 🛡️ 5. Sample Security Filter Configuration

Secure your Spring Boot resources with a standard security configuration using **Spring Security 6.x** and stateless sessions:

```java
package com.edupredict.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> {}) // Uses WebMvcConfigurer configuration
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/login", "/api/auth/register", "/api/auth/forgot-password", "/api/auth/verify-otp", "/api/auth/reset-password").permitAll()
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

This guide ensures a clean handoff between the high-fidelity UI and your production-ready Spring Boot backend service!
