export function isMissingTableError(error) {
    if (!error) return false;
    if (error.code === '42P01') return true;
    const message = String(error.message || '').toLowerCase();
    return message.includes('relation') && message.includes('does not exist');
}

export function getFeatureRebuildMessage(featureLabel = 'This feature') {
    return `${featureLabel} is temporarily unavailable while we rebuild this part of the database.`;
}
