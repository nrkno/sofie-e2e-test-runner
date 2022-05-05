import { CCol, CFormInput, CFormLabel, CFormText, CFormTextarea, CRow } from '@coreui/react'
import React from 'react'
import { GitRepositorySource, Source } from '../../../lib/collections/Sources'

export const SourceGitEdit: React.FC<{
	sourceObj: GitRepositorySource
	setSourceObj: React.Dispatch<React.SetStateAction<Source>>
}> = function SourceGitEdit({ sourceObj, setSourceObj }) {
	return (
		<>
			<CRow className="mb-3">
				<CCol xs>
					<CFormLabel>Repository URL</CFormLabel>
					<CFormInput
						type="text"
						placeholder="git@github.com:organization/repository.git"
						value={sourceObj.url}
						onChange={(e) =>
							setSourceObj({
								...sourceObj,
								url: e.target.value,
							})
						}
					/>
					<CFormText>Use either SSH or HTTPS form</CFormText>
				</CCol>
			</CRow>
			<CRow className="mb-3">
				<CCol xs>
					<CFormLabel>SSH Key</CFormLabel>
					<CFormTextarea
						value={sourceObj.privateKey}
						onChange={(e) =>
							setSourceObj({
								...sourceObj,
								privateKey: e.target.value,
							})
						}
					/>
					<CFormText>SSH key to be used when connecting via SSH</CFormText>
				</CCol>
			</CRow>
		</>
	)
}
