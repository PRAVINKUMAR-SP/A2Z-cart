param(
    [Parameter(Mandatory=$false)]
    [string]$Password = "pravin007"
)

$env:RDS_PASSWORD = $Password
Write-Host "Running AWS RDS connection test against a2z.cn4k6qwks3p5.ap-south-1.rds.amazonaws.com..." -ForegroundColor Cyan

& "..\backend-tools\apache-maven-3.9.9\bin\mvn.cmd" test-compile "exec:java" "-Dexec.mainClass=com.a2zcart.App" "-Dexec.args=$Password"
