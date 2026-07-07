!macro customUnInstall
    ${ifNot} ${isUpdated}
        DetailPrint "Removing Auto Lossless Scaling startup task"
        ExecWait '"$SYSDIR\schtasks.exe" /Delete /TN "Auto Lossless Scaling - Run as Admin" /F'

        SetShellVarContext current
        DetailPrint "Removing Auto Lossless Scaling launcher scripts"
        Delete "$DOCUMENTS\run-auto-lossless-scaling-as-admin.vbs"
        Delete "$DOCUMENTS\run-lossless-scaling-as-admin.vbs"
        Delete "$DOCUMENTS\run-riva-tuner-as-admin.vbs"
    ${endIf}
!macroend
