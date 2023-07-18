import { createAction, fetchAsync, FetchResponse } from 'actions';
import Button from 'elements/Button';
import MobileLayout from 'elements/MobileLayout';
import React from 'react';
import {
  Form,
  json,
  redirect,
  useNavigate,
  useParams,
  useSubmit,
} from 'react-router-dom';
import styled from 'styled-components';
import {
  throwValidationError,
  useConfirmNav,
  useDnDListHandlers,
  useTypedLoaderData,
} from 'hooks';
import DefaultTopBar from 'components/DefaultTopBar';
import { QuizTemplateResponse, RoundTemplateResponse } from 'shared/responses';
import TextCenter from 'elements/TextCenter';
import { getColors } from 'style';
import InlineIconButton from 'elements/InlineIconButton';
import IconLeft from 'elements/IconLeft';
import HiddenTextField from 'components/HiddenTextField';
import { updateCacheQuizTemplate } from 'cache';
import Img from 'elements/Img';

const InnerRoot = styled.div<Object>(() => {
  return {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  };
});

const ITEM_HEIGHT = 52;

interface ReorderRoundsValues {
  roundOrder: string;
}
const action = createAction(async (values: ReorderRoundsValues, params) => {
  if (!values.roundOrder) {
    throwValidationError('Please fill out the form.', values);
  }

  const result = await fetchAsync<QuizTemplateResponse>(
    'put',
    `/api/template/quiz/${params.quizTemplateId}/reorder`,
    {
      roundOrder: values.roundOrder.split(','),
    }
  );

  if (result.error) {
    throwValidationError(result.message, values);
  }

  updateCacheQuizTemplate(result.data.id, result);

  return null;
});

interface ListRoundTemplatesLoaderResponse {
  roundTemplates: RoundTemplateResponse[];
  quizTemplate: QuizTemplateResponse;
}
const loader = async ({ params }) => {
  console.log('loader params', params);

  const roundTemplatesResponse = await fetchAsync<
    FetchResponse<RoundTemplateResponse[]>
  >('get', '/api/template/all/round/' + params.quizTemplateId);

  if (roundTemplatesResponse.error) {
    if (roundTemplatesResponse.status === 403) {
      return redirect('/login');
    }

    throw new Response('', {
      status: roundTemplatesResponse.status,
      statusText: roundTemplatesResponse.message,
    });
  }

  const quizTemplateResponse = await fetchAsync<QuizTemplateResponse>(
    'get',
    '/api/template/quiz/' + params.quizTemplateId
  );

  if (quizTemplateResponse.error) {
    if (quizTemplateResponse.status === 403) {
      return redirect('/login');
    }

    throw new Response('', {
      status: quizTemplateResponse.status,
      statusText: quizTemplateResponse.message,
    });
  }

  return json({
    ...roundTemplatesResponse,
    data: {
      roundTemplates: roundTemplatesResponse.data,
      quizTemplate: quizTemplateResponse.data,
    },
  });
};

const ListRoundTemplates = () => {
  const navigate = useNavigate();
  const params = useParams();
  const submit = useSubmit();

  const loaderResponse = useTypedLoaderData<
    FetchResponse<ListRoundTemplatesLoaderResponse>
  >({
    isError: false,
  });

  const [orderedRoundTemplates, setOrderedRoundTemplates] = React.useState(
    loaderResponse?.data?.quizTemplate?.roundOrder ?? []
  );

  const drag = useDnDListHandlers({
    itemHeight: ITEM_HEIGHT,
    arr: orderedRoundTemplates,
    setArr: setOrderedRoundTemplates,
    clickOffset: 0,
  });
  const { dragWasEdited, dragState, handleDragStart, resetDragState } = {
    dragWasEdited: drag.dragWasEdited,
    dragState: drag.dragState,
    handleDragStart: drag.handleDragStart,
    resetDragState: drag.resetDragState,
  };

  const confirmDialog = useConfirmNav(dragWasEdited);

  const handleCreateRoundTemplateClick = (ev: React.MouseEvent) => {
    ev.preventDefault();
    navigate(`/quiz-template/${params.quizTemplateId}/round-template-new`);
  };

  const handleEditRoundTemplateClick =
    (id: string) => (ev: React.MouseEvent) => {
      ev.preventDefault();
      ev.stopPropagation();
      navigate(
        `/quiz-template/${params.quizTemplateId}/round-template/${id}/edit`
      );
    };

  const handleRoundTemplateClick = (id: string) => (ev: React.MouseEvent) => {
    ev.preventDefault();
    navigate(
      `/quiz-template/${params.quizTemplateId}/round-template/${id}/question-templates`
    );
  };

  const handleEditQuizTemplateClick = (ev: React.MouseEvent) => {
    ev.preventDefault();
    ev.stopPropagation();
    navigate('/quiz-template/' + params.quizTemplateId + '/edit');
  };

  return (
    <>
      <DefaultTopBar upTo="/quiz-templates" />
      <MobileLayout topBar>
        <InnerRoot>
          <p
            style={
              {
                // width: '80%',
              }
            }
          >
            <InlineIconButton
              imgSrc="/res/edit.svg"
              onClick={handleEditQuizTemplateClick}
            ></InlineIconButton>
            <span
              style={{
                color: getColors().TEXT_DESCRIPTION,
              }}
            >
              Now editing quiz:
            </span>{' '}
            {loaderResponse?.data.quizTemplate.name}
          </p>

          <Button
            disabled={
              (loaderResponse?.data.roundTemplates.length ?? 0) >=
              (loaderResponse?.data.quizTemplate.numRounds ?? 0)
            }
            color="primary"
            style={{
              width: '100%',
            }}
            onClick={handleCreateRoundTemplateClick}
          >
            + Create New Round Template
          </Button>
          <p>
            Round Templates ({loaderResponse?.data.roundTemplates?.length}/
            {loaderResponse?.data.quizTemplate.numRounds})
          </p>
          {orderedRoundTemplates?.map((templateId, i) => {
            const t = loaderResponse?.data.roundTemplates.find(
              t => t.id === templateId
            );
            if (!t) {
              return null;
            }

            // const isDraggingThis = dragState.dragging && t.id === dragState.id;
            const isDraggingThis = false;

            return (
              <div key={t.id}>
                {isDraggingThis ? (
                  <div
                    style={{
                      width: '100%',
                      height: '52px',
                      border: '1px solid ' + getColors().PRIMARY,
                      boxSizing: 'border-box',
                    }}
                  ></div>
                ) : null}
                <Button
                  id={t.id}
                  color="secondary"
                  style={{
                    width: '100%',
                    maxWidth: '800px',
                    position: isDraggingThis ? 'absolute' : 'unset',
                  }}
                  onClick={
                    dragState.dragging
                      ? () => void 0
                      : handleRoundTemplateClick(t.id)
                  }
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        width: '100%',
                      }}
                    >
                      <InlineIconButton
                        imgSrc="/res/drag-handle.svg"
                        onMouseDown={ev => handleDragStart(t.id)(ev)}
                        onTouchStart={ev => handleDragStart(t.id)(ev)}
                        onClick={ev => {
                          ev.stopPropagation();
                          ev.preventDefault();
                        }}
                      ></InlineIconButton>
                      <span
                        style={{
                          marginRight: '16px',
                        }}
                      >
                        {i + 1}.
                      </span>
                      <div
                        style={{
                          width: 'calc(100% - 100px)',
                          overflow: 'hidden',
                          whiteSpace: 'pre',
                          marginRight: '8px',
                          textOverflow: 'ellipsis',
                          textAlign: 'left',
                        }}
                      >
                        <span>{t.title}</span>
                      </div>
                      <div
                        style={{
                          width: '22px',
                          flexShrink: 0,
                        }}
                        onClick={handleEditRoundTemplateClick(t.id)}
                      >
                        <Img alt="Edit" src="/res/edit.svg" />
                      </div>
                    </div>
                  </div>
                </Button>
              </div>
            );
          })}
          <Form method="post" id="reorder-rounds-form">
            {dragWasEdited ? (
              <p>
                <HiddenTextField
                  name="roundOrder"
                  value={orderedRoundTemplates.join(',')}
                />
                <Button
                  type="submit"
                  color="primary"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onClick={ev => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    resetDragState();
                    const form = document.getElementById(
                      'reorder-rounds-form'
                    ) as any;
                    if (form) {
                      form.elements['roundOrder'].value =
                        orderedRoundTemplates.join(',');
                      submit(form);
                    }
                  }}
                >
                  <IconLeft src="/res/check-mark.svg" /> Save
                </Button>
              </p>
            ) : null}
          </Form>
          {loaderResponse?.data.roundTemplates.length === 0 ? (
            <TextCenter>(none)</TextCenter>
          ) : null}
          <a
            href={
              '/api/template/export/quiz/' +
              loaderResponse?.data?.quizTemplate.id
            }
          >
            Download as HTML
          </a>
        </InnerRoot>
      </MobileLayout>
      {confirmDialog}
    </>
  );
};

export const ListRoundTemplatesRoute = {
  path: '/quiz-template/:quizTemplateId/round-templates',
  element: <ListRoundTemplates />,
  action,
  loader,
};
