  java -server \
    -XX:+UseG1GC \
    -Xmx${RHIANNON_MAX_HEAP:-100m} \
    -XX:+UseStringDeduplication \
    -jar jambuds-rhiannon.jar
    # "-XX:+UnlockExperimentalVMOptions",\
    # "-XX:+UseCGroupMemoryLimitForHeap",\
    # "-XX:InitialRAMFraction=2",\
    # "-XX:MinRAMFraction=2",\
    # "-XX:MaxRAMFraction=2",\
    # "-XX:MaxGCPauseMillis=100",\