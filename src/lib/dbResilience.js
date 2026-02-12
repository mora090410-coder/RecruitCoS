export function isMissingTableError(error) {
    if (!error) return false;
    if (error.code === '42P01' || error.code === 'PGRST205') return true;
    const message = String(error.message || '').toLowerCase();
    if (message.includes('relation') && message.includes('does not exist')) return true;
    return message.includes('could not find the table') && message.includes('schema cache');
}

export function getFeatureRebuildMessage(featureLabel = 'This feature') {
    return `${featureLabel} is temporarily unavailable while we rebuild this part of the database.`;
}
