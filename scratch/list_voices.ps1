Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.GetInstalledVoices() | ForEach-Object {
    $v = $_.VoiceInfo
    Write-Host "Voice Name: $($v.Name) | Culture: $($v.Culture.Name) | Gender: $($v.Gender)"
}
