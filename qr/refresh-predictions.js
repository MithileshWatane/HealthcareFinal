// Refresh predictions manually
async function refreshPredictions() {
    const patientId = getPatientId();
    if (!patientId) return;

    const predictionsSection = document.getElementById('predictions-section');
    if (predictionsSection) {
        predictionsSection.innerHTML = renderPredictionsLoading();
    }

    try {
        // Fetch all data again
        const [patientData, documents, mentalHealthScores, lifestyleData] = await Promise.all([
            fetchPatientData(patientId),
            fetchPatientDocuments(patientId),
            fetchMentalHealthScores(patientId),
            fetchLifestyleData(patientId)
        ]);

        // Force generate new predictions (bypass cache)
        const aiPredictions = await generateAIPredictions(
            patientData,
            lifestyleData,
            mentalHealthScores,
            documents
        );

        if (predictionsSection) {
            predictionsSection.innerHTML = renderHealthPredictions(
                aiPredictions.predictions,
                aiPredictions.testRecommendations,
                aiPredictions.riskAssessments,
                aiPredictions.summary,
                new Date().toISOString(),
                false
            );
        }
    } catch (error) {
        console.error('Error refreshing predictions:', error);
        if (predictionsSection) {
            predictionsSection.innerHTML = renderPredictionsError(error.message);
        }
    }
}
