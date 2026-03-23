# Use Maven image to build the appilcation
from maven:3.9.11-eclipse-temurin-21 as build
# Set the working directory
WORKDIR /app
# Copy the pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B
# Copy the source code
COPY src ./src
# Build the application(skip tests for faster build)
RUN mvn clean package -DskipTests
# Use JDK image to run the application
from eclipse-temurin:21-jre
# Set the working directory
WORKDIR /app
# Copy the jar file from build stage
COPY --from=build /app/target/*.jar app.jar
# Expose the application port
EXPOSE 8080
# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]